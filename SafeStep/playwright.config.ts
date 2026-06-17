import { defineConfig, devices } from '@playwright/test';
import path from 'path';

export default defineConfig({
  testDir: './e2e/tests',
  outputDir: './test-results',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],

  use: {
    baseURL: 'http://localhost:8081',
    screenshot: 'on',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    locale: 'pt-BR',
    viewport: { width: 390, height: 844 },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: `npx serve "${path.join(__dirname, 'web-build')}" --listen 8081 --single`,
    port: 8081,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
