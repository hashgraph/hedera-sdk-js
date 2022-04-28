import { devices } from '@playwright/test';

/**
 * @type {import("@playwright/test").PlaywrightTestConfig}
 */
const config = {
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  use: {
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
};

if (process.platform === "darwin") {
    config.projects.push({
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    });
}

export default config;
