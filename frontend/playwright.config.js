import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './test',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:3000',
    headless: true
  }
})
