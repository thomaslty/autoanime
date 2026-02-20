import { test, expect } from '@playwright/test'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SONARR_URL = 'http://localhost:8989'
const JUJUTSU_TITLE = 'Jujutsu Kaisen'

function getSonarrApiKey() {
  if (process.env.SONARR_API_KEY) return process.env.SONARR_API_KEY
  // Fallback: read from root .env file
  const envPath = path.resolve(__dirname, '../../.env')
  const envContent = fs.readFileSync(envPath, 'utf-8')
  const match = envContent.match(/^SONARR_API_KEY=(.+)$/m)
  if (!match) throw new Error('SONARR_API_KEY not found in env or .env file')
  return match[1].trim()
}

function sonarrHeaders() {
  return {
    'X-Api-Key': getSonarrApiKey(),
    'Content-Type': 'application/json',
  }
}

test.describe('Sync New', () => {
  let addedSonarrSeriesId = null
  let addedAutoAnimeSeriesId = null

  test.afterAll(async ({ request }) => {
    // Cleanup: delete JUJUTSU KAISEN from Sonarr
    if (addedSonarrSeriesId) {
      await request.delete(
        `${SONARR_URL}/api/v3/series/${addedSonarrSeriesId}?deleteFiles=true`,
        { headers: sonarrHeaders() }
      )
    }
    // Cleanup: delete from AutoAnime DB
    if (addedAutoAnimeSeriesId) {
      await request.delete(`/api/sonarr/series/${addedAutoAnimeSeriesId}`)
    }
  })

  test('only syncs new series not already in AutoAnime', async ({ page, request }) => {
    test.setTimeout(120_000)

    // --- Step 1: Get all series from Sonarr, extract config from frieren ---
    const sonarrRes = await request.get(`${SONARR_URL}/api/v3/series`, {
      headers: sonarrHeaders(),
    })
    expect(sonarrRes.ok()).toBeTruthy()
    const sonarrSeries = await sonarrRes.json()

    const frieren = sonarrSeries.find(s =>
      s.title.toLowerCase().includes('frieren')
    )
    expect(frieren).toBeTruthy()

    const { qualityProfileId, rootFolderPath } = frieren

    // --- Step 2: Remove JUJUTSU KAISEN from Sonarr if present (cleanup from previous runs) ---
    const existingJujutsu = sonarrSeries.find(s =>
      s.title.toLowerCase().includes('jujutsu')
    )
    if (existingJujutsu) {
      await request.delete(
        `${SONARR_URL}/api/v3/series/${existingJujutsu.id}?deleteFiles=true`,
        { headers: sonarrHeaders() }
      )
    }

    // --- Step 3: Baseline — ensure AutoAnime is synced with Sonarr (frieren only) ---
    // Delete all series from AutoAnime DB
    const aaListRes = await request.get('/api/sonarr/series')
    const aaSeries = await aaListRes.json()
    for (const s of aaSeries) {
      await request.delete(`/api/sonarr/series/${s.id}`)
    }

    // Full sync to pull frieren into AutoAnime
    await request.post('/api/sonarr/sync', { data: { mode: 'full' } })

    // Poll until sync completes
    await expect(async () => {
      const statusRes = await request.get('/api/sonarr/sync/status')
      const status = await statusRes.json()
      expect(status.status).toBe('idle')
    }).toPass({ timeout: 60_000, intervals: [1_000] })

    // --- Step 4: Verify baseline — frieren is visible on homepage ---
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Frieren should be visible (check poster alt text)
    await expect(page.getByRole('img', { name: /frieren/i })).toBeVisible({ timeout: 10_000 })

    // Record baseline series count
    const baselineCards = await page.locator('[class*="group"][class*="cursor-pointer"]').count()
    expect(baselineCards).toBeGreaterThan(0)

    // --- Step 5: Add JUJUTSU KAISEN to Sonarr ---
    const lookupRes = await request.get(
      `${SONARR_URL}/api/v3/series/lookup?term=${encodeURIComponent(JUJUTSU_TITLE)}`,
      { headers: sonarrHeaders() }
    )
    expect(lookupRes.ok()).toBeTruthy()
    const lookupResults = await lookupRes.json()

    const jujutsuData = lookupResults.find(s =>
      s.title.toLowerCase().includes('jujutsu kaisen')
    )
    expect(jujutsuData).toBeTruthy()

    // Add to Sonarr with required fields
    const addRes = await request.post(`${SONARR_URL}/api/v3/series`, {
      headers: sonarrHeaders(),
      data: {
        ...jujutsuData,
        qualityProfileId,
        rootFolderPath,
        monitored: true,
        seriesType: 'anime',
        seasonFolder: true,
        addOptions: {
          ignoreEpisodesWithFiles: true,
          ignoreEpisodesWithoutFiles: true,
          searchForMissingEpisodes: false,
        },
      },
    })
    expect(addRes.ok()).toBeTruthy()
    const addedSeries = await addRes.json()
    addedSonarrSeriesId = addedSeries.id

    // --- Step 6: Click "Sync New" in AutoAnime ---
    await page.getByRole('button', { name: 'Sync' }).click()
    await page.getByRole('menuitem', { name: 'Sync New' }).click()

    // --- Step 7: Wait for sync to complete ---
    await expect(async () => {
      const statusRes = await request.get('/api/sonarr/sync/status')
      const status = await statusRes.json()
      expect(status.status).toBe('idle')
    }).toPass({ timeout: 60_000, intervals: [1_000] })

    // Wait for the page to refresh and show updated series
    await page.waitForTimeout(2_000)
    await page.reload()
    await page.waitForLoadState('networkidle')

    // --- Step 8: Verify JUJUTSU KAISEN appears ---
    await expect(page.getByRole('img', { name: /jujutsu/i })).toBeVisible({ timeout: 10_000 })

    // Frieren should still be there
    await expect(page.getByRole('img', { name: /frieren/i })).toBeVisible()

    // Series count should have increased
    const newCards = await page.locator('[class*="group"][class*="cursor-pointer"]').count()
    expect(newCards).toBeGreaterThan(baselineCards)

    // Save AutoAnime series ID for cleanup
    const finalListRes = await request.get('/api/sonarr/series')
    const finalList = await finalListRes.json()
    const jujutsuInAA = finalList.find(s =>
      s.title.toLowerCase().includes('jujutsu')
    )
    if (jujutsuInAA) {
      addedAutoAnimeSeriesId = jujutsuInAA.id
    }
  })
})
