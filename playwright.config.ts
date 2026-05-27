import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  outputDir: './audit',
  use: {
    baseURL: 'https://posture-at-work.vercel.app',
    screenshot: 'on',
    video: 'off',
  },
  reporter: [['list'], ['json', { outputFile: 'audit/report.json' }]],
})
