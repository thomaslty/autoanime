import { test, expect } from '@playwright/test'

test.describe('Settings Page - Negative Connection Checks', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')
  })

  test.describe('Sonarr', () => {
    test('Test Connection with bad URL shows inline error in Sonarr block', async ({ page }) => {
      const sonarrCard = page.locator('text=Sonarr Configuration').locator('..')
        .locator('..')

      await page.getByLabel('Sonarr URL').fill('http://localhost:9999')
      await page.getByLabel('API Key').fill('badkey123')

      await sonarrCard.getByRole('button', { name: 'Test Connection' }).click()

      // Error should appear inside the Sonarr card, not at the top of the page
      const errorAlert = sonarrCard.locator('.bg-red-100, .dark\\:bg-red-900')
      await expect(errorAlert).toBeVisible({ timeout: 10000 })
      await expect(errorAlert).toContainText(/failed|error|refused/i)

      // Close button should exist
      const closeButton = errorAlert.locator('button')
      await expect(closeButton).toBeVisible()
    })

    test('Test Connection close button dismisses error', async ({ page }) => {
      const sonarrCard = page.locator('text=Sonarr Configuration').locator('..')
        .locator('..')

      await page.getByLabel('Sonarr URL').fill('http://localhost:9999')
      await page.getByLabel('API Key').fill('badkey123')

      await sonarrCard.getByRole('button', { name: 'Test Connection' }).click()

      const errorAlert = sonarrCard.locator('.bg-red-100, .dark\\:bg-red-900')
      await expect(errorAlert).toBeVisible({ timeout: 10000 })

      // Click close button
      await errorAlert.locator('button').click()
      await expect(errorAlert).not.toBeVisible()
    })

    test('Save Configuration with bad URL shows inline error (connection pre-check)', async ({ page }) => {
      const sonarrCard = page.locator('text=Sonarr Configuration').locator('..')
        .locator('..')

      await page.getByLabel('Sonarr URL').fill('http://localhost:9999')
      await page.getByLabel('API Key').fill('badkey123')

      await sonarrCard.getByRole('button', { name: 'Save Configuration' }).click()

      // Error should appear inside the Sonarr card (connection pre-check failed)
      const errorAlert = sonarrCard.locator('.bg-red-100, .dark\\:bg-red-900')
      await expect(errorAlert).toBeVisible({ timeout: 10000 })
      await expect(errorAlert).toContainText(/failed|error|refused/i)
    })

    test('Error does not appear at page top level', async ({ page }) => {
      await page.getByLabel('Sonarr URL').fill('http://localhost:9999')
      await page.getByLabel('API Key').fill('badkey123')

      const sonarrCard = page.locator('text=Sonarr Configuration').locator('..')
        .locator('..')
      await sonarrCard.getByRole('button', { name: 'Test Connection' }).click()

      // Wait for error to appear in the card
      const errorInCard = sonarrCard.locator('.bg-red-100, .dark\\:bg-red-900')
      await expect(errorInCard).toBeVisible({ timeout: 10000 })

      // No error alert should exist outside of the service cards (at page top)
      // The parent container of cards is the direct child of the main content area
      const topLevelError = page.locator('h2:text("Settings") + .bg-red-100')
      await expect(topLevelError).not.toBeVisible()
    })
  })

  test.describe('qBittorrent', () => {
    test('Test Connection with bad URL shows inline error in qBittorrent block', async ({ page }) => {
      const qbitCard = page.locator('text=qBittorrent Configuration').locator('..')
        .locator('..')

      await page.getByLabel('qBittorrent URL').fill('http://localhost:9999')
      await page.getByLabel('Username').fill('baduser')
      await page.getByLabel('Password').fill('badpass')

      await qbitCard.getByRole('button', { name: 'Test Connection' }).click()

      const errorAlert = qbitCard.locator('.bg-red-100, .dark\\:bg-red-900')
      await expect(errorAlert).toBeVisible({ timeout: 10000 })
      await expect(errorAlert).toContainText(/failed|error|refused/i)

      // Close button should exist
      const closeButton = errorAlert.locator('button')
      await expect(closeButton).toBeVisible()
    })

    test('Test Connection close button dismisses error', async ({ page }) => {
      const qbitCard = page.locator('text=qBittorrent Configuration').locator('..')
        .locator('..')

      await page.getByLabel('qBittorrent URL').fill('http://localhost:9999')
      await page.getByLabel('Username').fill('baduser')
      await page.getByLabel('Password').fill('badpass')

      await qbitCard.getByRole('button', { name: 'Test Connection' }).click()

      const errorAlert = qbitCard.locator('.bg-red-100, .dark\\:bg-red-900')
      await expect(errorAlert).toBeVisible({ timeout: 10000 })

      // Click close button
      await errorAlert.locator('button').click()
      await expect(errorAlert).not.toBeVisible()
    })

    test('Save Configuration with bad URL shows inline error (connection pre-check)', async ({ page }) => {
      const qbitCard = page.locator('text=qBittorrent Configuration').locator('..')
        .locator('..')

      await page.getByLabel('qBittorrent URL').fill('http://localhost:9999')
      await page.getByLabel('Username').fill('baduser')
      await page.getByLabel('Password').fill('badpass')

      await qbitCard.getByRole('button', { name: 'Save Configuration' }).click()

      const errorAlert = qbitCard.locator('.bg-red-100, .dark\\:bg-red-900')
      await expect(errorAlert).toBeVisible({ timeout: 10000 })
      await expect(errorAlert).toContainText(/failed|error|refused/i)
    })

    test('Error does not appear at page top level', async ({ page }) => {
      const qbitCard = page.locator('text=qBittorrent Configuration').locator('..')
        .locator('..')

      await page.getByLabel('qBittorrent URL').fill('http://localhost:9999')
      await page.getByLabel('Username').fill('baduser')
      await page.getByLabel('Password').fill('badpass')

      await qbitCard.getByRole('button', { name: 'Test Connection' }).click()

      const errorInCard = qbitCard.locator('.bg-red-100, .dark\\:bg-red-900')
      await expect(errorInCard).toBeVisible({ timeout: 10000 })

      // No error alert at page top
      const topLevelError = page.locator('h2:text("Settings") + .bg-red-100')
      await expect(topLevelError).not.toBeVisible()
    })
  })
})
