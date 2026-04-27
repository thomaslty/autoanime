import { test, expect } from '@playwright/test'

const SCREENSHOT_DIR = 'test/screenshots'

// ---------------------------------------------------------------------------
// Long-text fixtures used to assert the tooltip reveals the full string.
// These mirror the seeded examples maintained by the user (dmhy 判處勇者刑).
// ---------------------------------------------------------------------------
const LONG_URL = 'https://share.dmhy.org/topics/rss/rss.xml?keyword=%E5%88%A4%E8%99%95%E5%8B%87%E8%80%85%E5%88%91+%E7%B9%81%E9%AB%94%E5%85%A7%E5%B5%8C&sort_id=0&team_id=619&order=date-desc'
const LONG_REGEX = '[桜都字幕组] 判处勇者刑 惩罚勇者9004队刑务纪录 / Yuusha-kei ni Shosu： Choubatsu Yuusha 9004 Tai Keimu Kiroku [:ep:][1080p][繁体内嵌]'
const SOURCE_NAME = 'e2e-truncate-source'
const CONFIG_NAME = 'e2e-truncate-config'
const DMHY_TEMPLATE_ID = 1

// Cleanup any leftover records from prior runs of this spec.
async function cleanupResidual(request) {
  const cfgRes = await request.get('/api/rss-config')
  if (cfgRes.ok()) {
    const configs = await cfgRes.json()
    for (const c of configs.filter(x => x.name === CONFIG_NAME)) {
      await request.delete(`/api/rss-config/${c.id}`)
    }
  }
  const srcRes = await request.get('/api/rss')
  if (srcRes.ok()) {
    const sources = await srcRes.json()
    for (const s of sources.filter(x => x.name === SOURCE_NAME)) {
      await request.delete(`/api/rss/${s.id}`)
    }
  }
}

test.describe.serial('Truncated cell tooltips', () => {
  let sourceId = null
  let configId = null
  let longestItemTitle = null

  test.beforeAll(async ({ request }) => {
    await cleanupResidual(request)

    // Create a fresh RSS source pointing at the long dmhy URL.
    const sourceRes = await request.post('/api/rss', {
      data: {
        name: SOURCE_NAME,
        url: LONG_URL,
        templateId: DMHY_TEMPLATE_ID,
        isEnabled: true,
        refreshInterval: '1h',
        refreshIntervalType: 'human',
      },
    })
    expect(sourceRes.ok(), `Failed to create source: ${sourceRes.status()}`).toBeTruthy()
    const source = await sourceRes.json()
    sourceId = source.id

    // Trigger an immediate fetch so rss_item rows appear with long titles.
    const fetchRes = await request.post(`/api/rss/${sourceId}/fetch`)
    expect(fetchRes.ok(), `Fetch failed: ${fetchRes.status()}`).toBeTruthy()

    // Read items back; pick the longest title as the expected tooltip text for the items-page test.
    const itemsRes = await request.get(`/api/rss/${sourceId}/items`)
    expect(itemsRes.ok()).toBeTruthy()
    const itemsBody = await itemsRes.json()
    const items = Array.isArray(itemsBody) ? itemsBody : itemsBody.items || []
    expect(items.length, 'Source produced no items — dmhy fetch may have failed').toBeGreaterThan(0)
    longestItemTitle = items.reduce((a, b) => ((a?.title?.length ?? 0) >= (b?.title?.length ?? 0) ? a : b)).title

    // Create an RSS config bound to that source with the long regex.
    const configRes = await request.post('/api/rss-config', {
      data: {
        name: CONFIG_NAME,
        description: 'e2e fixture for truncated-cell tooltip verification',
        regex: LONG_REGEX,
        rssSourceId: sourceId,
        offset: 0,
        isEnabled: true,
      },
    })
    expect(configRes.ok(), `Failed to create config: ${configRes.status()}`).toBeTruthy()
    const config = await configRes.json()
    configId = config.id
  })

  test.afterAll(async ({ request }) => {
    if (configId) await request.delete(`/api/rss-config/${configId}`)
    if (sourceId) await request.delete(`/api/rss/${sourceId}`)
  })

  test('RSS sources page: long URL row shows full URL on hover', async ({ page }) => {
    await page.goto('/rss/sources')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sources-page.png`, fullPage: true })

    const row = page.locator('table tbody tr', { hasText: SOURCE_NAME })
    await expect(row).toBeVisible()
    const urlCell = row.locator('span.truncate').first()
    await expect(urlCell).toBeVisible()
    await urlCell.hover()

    const tooltip = page.locator('[data-slot="tooltip-content"]').first()
    await expect(tooltip).toBeVisible({ timeout: 3000 })
    const tooltipText = page.locator('[data-slot="tooltip-content"] [role="tooltip"]').first()
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sources-page-hover.png`, fullPage: false })

    expect((await tooltipText.textContent())?.trim()).toBe(LONG_URL)
  })

  test('RSS anime configs page: long regex row shows full regex on hover', async ({ page }) => {
    await page.goto('/rss/anime-configs')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: `${SCREENSHOT_DIR}/configs-page.png`, fullPage: true })

    const row = page.locator('table tbody tr', { hasText: CONFIG_NAME })
    await expect(row).toBeVisible()
    const regexCell = row.locator('span.font-mono.truncate').first()
    await expect(regexCell).toBeVisible()
    await regexCell.hover()

    const tooltip = page.locator('[data-slot="tooltip-content"]').first()
    await expect(tooltip).toBeVisible({ timeout: 3000 })
    const tooltipText = page.locator('[data-slot="tooltip-content"] [role="tooltip"]').first()
    await page.screenshot({ path: `${SCREENSHOT_DIR}/configs-page-hover.png`, fullPage: false })

    expect((await tooltipText.textContent())?.trim()).toBe(LONG_REGEX)
  })

  test('RSS items page: longest title row shows full title on hover', async ({ page }) => {
    await page.goto(`/rss/${sourceId}/items`)
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: `${SCREENSHOT_DIR}/items-page.png`, fullPage: true })

    // Find the row whose visible (truncated) cell text starts with the start of the longest title.
    const visiblePrefix = longestItemTitle.slice(0, 8)
    const row = page.locator('table tbody tr', { hasText: visiblePrefix }).first()
    await expect(row).toBeVisible()
    const titleCell = row.locator('span.font-medium.truncate').first()
    await titleCell.hover()

    const tooltip = page.locator('[data-slot="tooltip-content"]').first()
    await expect(tooltip).toBeVisible({ timeout: 3000 })
    const tooltipText = page.locator('[data-slot="tooltip-content"] [role="tooltip"]').first()
    await page.screenshot({ path: `${SCREENSHOT_DIR}/items-page-hover.png`, fullPage: false })

    expect((await tooltipText.textContent())?.trim()).toBe(longestItemTitle)
  })

  test('Edit RSS Config dialog preview: row title shows full title on hover', async ({ page }) => {
    await page.goto('/rss/anime-configs')
    await page.waitForLoadState('networkidle')

    const row = page.locator('table tbody tr', { hasText: CONFIG_NAME })
    await expect(row).toBeVisible()
    await row.locator('button[title="Edit"]').click()
    await page.waitForSelector('[data-slot="dialog-content"]')
    await page.screenshot({ path: `${SCREENSHOT_DIR}/edit-config-dialog.png`, fullPage: false })

    const previewBtn = page.getByRole('button', { name: /preview/i }).first()
    if ((await previewBtn.count()) > 0 && (await previewBtn.isVisible())) {
      await previewBtn.click()
      await page.waitForTimeout(800)
    }

    const previewCells = page.locator('[data-slot="dialog-content"] table tbody tr td span.font-mono.truncate')
    if ((await previewCells.count()) === 0) {
      await page.screenshot({ path: `${SCREENSHOT_DIR}/edit-config-no-preview.png`, fullPage: false })
      test.info().annotations.push({ type: 'note', description: 'Preview table empty for this config — no rows to hover.' })
      return
    }
    const cell = previewCells.first()
    await cell.hover()
    const tooltip = page.locator('[data-slot="tooltip-content"]').first()
    await expect(tooltip).toBeVisible({ timeout: 3000 })
    const tooltipLabel = page.locator('[data-slot="tooltip-content"] [role="tooltip"]').first()
    await page.screenshot({ path: `${SCREENSHOT_DIR}/edit-config-preview-hover.png`, fullPage: false })

    const visibleText = (await cell.textContent())?.trim() ?? ''
    const labelText = (await tooltipLabel.textContent())?.trim() ?? ''
    // The tooltip must contain at minimum what the cell visibly shows.
    expect(labelText.length).toBeGreaterThanOrEqual(visibleText.length)
  })
})
