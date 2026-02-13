import { test, expect } from '@playwright/test'

test.describe('Homepage - Filter Query String Persistence', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test.describe('Auto-download filter', () => {
    test('selecting "With Auto-Download" updates URL query string', async ({ page }) => {
      await page.getByRole('combobox').click()
      await page.getByRole('option', { name: 'With Auto-Download' }).click()

      expect(page.url()).toContain('filter=with-auto-download')
    })

    test('selecting "Without Auto-Download" updates URL query string', async ({ page }) => {
      await page.getByRole('combobox').click()
      await page.getByRole('option', { name: 'Without Auto-Download' }).click()

      expect(page.url()).toContain('filter=without-auto-download')
    })

    test('selecting "All Series" removes filter from URL', async ({ page }) => {
      // First set a filter
      await page.getByRole('combobox').click()
      await page.getByRole('option', { name: 'With Auto-Download' }).click()
      expect(page.url()).toContain('filter=')

      // Then reset to all
      await page.getByRole('combobox').click()
      await page.getByRole('option', { name: 'All Series' }).click()
      expect(page.url()).not.toContain('filter=')
    })

    test('filter persists after page refresh', async ({ page }) => {
      await page.getByRole('combobox').click()
      await page.getByRole('option', { name: 'With Auto-Download' }).click()

      await page.reload()
      await page.waitForLoadState('networkidle')

      // The select should still show the filtered value
      await expect(page.getByRole('combobox')).toHaveText('With Auto-Download')
      expect(page.url()).toContain('filter=with-auto-download')
    })

    test('filter restores when navigating directly to URL with query param', async ({ page }) => {
      await page.goto('/?filter=without-auto-download')
      await page.waitForLoadState('networkidle')

      await expect(page.getByRole('combobox')).toHaveText('Without Auto-Download')
    })
  })

  test.describe('Search filter', () => {
    test('typing in search updates URL query string', async ({ page }) => {
      await page.getByPlaceholder('Search anime...').fill('naruto')

      expect(page.url()).toContain('q=naruto')
    })

    test('clearing search removes q from URL', async ({ page }) => {
      await page.getByPlaceholder('Search anime...').fill('naruto')
      expect(page.url()).toContain('q=naruto')

      await page.getByPlaceholder('Search anime...').fill('')
      expect(page.url()).not.toContain('q=')
    })

    test('search persists after page refresh', async ({ page }) => {
      await page.getByPlaceholder('Search anime...').fill('test')

      await page.reload()
      await page.waitForLoadState('networkidle')

      await expect(page.getByPlaceholder('Search anime...')).toHaveValue('test')
      expect(page.url()).toContain('q=test')
    })

    test('search restores when navigating directly to URL with query param', async ({ page }) => {
      await page.goto('/?q=hello')
      await page.waitForLoadState('networkidle')

      await expect(page.getByPlaceholder('Search anime...')).toHaveValue('hello')
    })
  })

  test.describe('Combined filters', () => {
    test('both search and filter are preserved in URL', async ({ page }) => {
      await page.getByPlaceholder('Search anime...').fill('anime')
      await page.getByRole('combobox').click()
      await page.getByRole('option', { name: 'Without Auto-Download' }).click()

      expect(page.url()).toContain('q=anime')
      expect(page.url()).toContain('filter=without-auto-download')
    })

    test('both filters persist after page refresh', async ({ page }) => {
      await page.goto('/?q=test&filter=with-auto-download')
      await page.waitForLoadState('networkidle')

      await expect(page.getByPlaceholder('Search anime...')).toHaveValue('test')
      await expect(page.getByRole('combobox')).toHaveText('With Auto-Download')
    })

    test('navigating away and back preserves filters via browser history', async ({ page }) => {
      await page.getByPlaceholder('Search anime...').fill('anime')
      await page.getByRole('combobox').click()
      await page.getByRole('option', { name: 'With Auto-Download' }).click()

      // Navigate away
      await page.goto('/settings')
      await page.waitForLoadState('networkidle')

      // Go back
      await page.goBack()
      await page.waitForLoadState('networkidle')

      await expect(page.getByPlaceholder('Search anime...')).toHaveValue('anime')
      await expect(page.getByRole('combobox')).toHaveText('With Auto-Download')
    })
  })
})
