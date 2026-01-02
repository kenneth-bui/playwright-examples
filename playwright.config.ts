import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  /* In CI, use HTML reporter with custom output directory based on REPORT_OUTPUT_DIR env var */
  reporter: process.env.CI 
    ? [['html', { outputFolder: process.env.REPORT_OUTPUT_DIR || 'playwright-report' }]]
    : 'html',
  
  /* Visual comparison settings */
  expect: {
    /* Threshold for visual comparison (0-1). Lower = more strict */
    /* Increased to 0.3 to account for OS rendering differences (macOS vs Linux) */
    /* OS differences: fonts, anti-aliasing, subpixel rendering can cause small pixel differences */
    toHaveScreenshot: { 
      threshold: 0.3, // Increased from 0.2 to handle OS rendering differences
      /* Maximum number of pixels that can differ (alternative to threshold) */
      maxDiffPixels: 1000, // Allow up to 1000 pixels to differ
      /* Animate diff images to highlight differences */
      animations: 'disabled', // Disable animations for consistent screenshots
    },
    /* Threshold for snapshot comparison */
    toMatchSnapshot: { threshold: 0.3 },
  },
  
  /* Use OS-specific snapshot folders for separate baselines per platform */
  /* Platform values: darwin (macOS), linux (Linux CI), win32 (Windows) */
  /* Dynamic folder per test file and OS: visual.spec.ts -> visual.spec.ts-snapshots-darwin/ or visual.spec.ts-snapshots-linux/ */
  /* {testFilePath} is the relative path from testDir (e.g., "visual.spec.ts") */
  /* Keeps separate snapshots per browser/device via {projectName} */
  /* Separate baselines allow OS-specific rendering differences (fonts, anti-aliasing, etc.) */
  snapshotPathTemplate: '{testDir}/{testFilePath}-snapshots-{platform}/{arg}-{projectName}{ext}',
  
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: 'https://the-internet.herokuapp.com/',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Screenshot settings - default to only-on-failure for regular tests */
    screenshot: 'only-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'edge',
      use: { ...devices['Desktop Edge'] },
    },

    {
      name: 'safari',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports - iOS devices */
    {
      name: 'Mobile Safari - iPhone 14',
      use: { ...devices['iPhone 14'] },
    },
    {
      name: 'Mobile Safari - iPhone SE',
      use: { ...devices['iPhone SE'] },
    },

    /* Test against mobile viewports - Android devices */
    {
      name: 'Mobile Chrome - Pixel 5',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Chrome - Galaxy S9+',
      use: { ...devices['Galaxy S9+'] },
    },

    /* Test against tablet viewports */
    {
      name: 'Tablet - iPad',
      use: { ...devices['iPad'] },
    },

    /* Custom viewports - Examples of creating your own viewport configurations */
    // {
    //   name: 'Custom - Small Mobile',
    //   use: {
    //     viewport: { width: 320, height: 568 }, // iPhone 5 size
    //     userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
    //     deviceScaleFactor: 2,
    //     isMobile: true,
    //     hasTouch: true,
    //   },
    // },
    // {
    //   name: 'Custom - Large Desktop',
    //   use: {
    //     viewport: { width: 2560, height: 1440 }, // 2K display
    //     deviceScaleFactor: 1,
    //     isMobile: false,
    //     hasTouch: false,
    //   },
    // },
    // {
    //   name: 'Custom - Tablet Landscape',
    //   use: {
    //     viewport: { width: 1024, height: 768 }, // iPad landscape
    //     deviceScaleFactor: 2,
    //     isMobile: true,
    //     hasTouch: true,
    //   },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
