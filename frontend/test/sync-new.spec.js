import { test, expect } from '@playwright/test'

test.describe('Sync New', () => {
  test('syncs series from Sonarr after clearing database', async ({ page }) => {
    // Step 1: Delete all series via API
    const listRes = await page.request.get('/api/sonarr/series')
    const seriesList = await listRes.json()

    for (const s of seriesList) {
      await page.request.delete(`/api/sonarr/series/${s.id}`)
    }

    // Verify homepage shows empty state
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('No anime series synced yet')).toBeVisible()

    // Step 2: Click Sync dropdown and select "Sync New"
    await page.getByRole('button', { name: 'Sync' }).click()
    await page.getByRole('menuitem', { name: 'Sync New' }).click()

    // Step 3: Wait for sync to complete — button text returns to "Sync"
    await expect(page.getByRole('button', { name: 'Sync' })).not.toHaveText(/Syncing/, { timeout: 60000 })

    // Verify at least 1 series card appears
    await expect(page.locator('[class*="group"]').filter({ has: page.locator('img') }).first()).toBeVisible({ timeout: 10000 })

    // Verify the empty state message is gone
    await expect(page.getByText('No anime series synced yet')).not.toBeVisible()
  })
})
