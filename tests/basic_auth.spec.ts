import { test, expect } from '@playwright/test';

// This describe block is for all tests that do not require authentication.
test.describe('Basic Auth - Unauthenticated', () => {
  // We navigate to the page without providing credentials.
  // This simulates the browser showing the auth popup, and if no
  // valid credentials are provided, the success message should not be present.
  // The multiple previous tests for unsuccessful login have been consolidated
  // into this single test because they all performed the exact same action and assertion.
  test('should not log in without credentials', async ({ page }) => {
    // Navigate using the relative path, leveraging the baseURL from playwright.config.ts
    await page.goto('/basic_auth');
    await expect(page.locator('body')).not.toContainText('Congratulations! You must have the proper credentials.');
  });
});

// This describe block is for tests with invalid credentials.
test.describe('Basic Auth - Invalid Credentials', () => {
  test.use({
    httpCredentials: {
      username: 'wronguser',
      password: 'wrongpassword',
    },
  });

  test('should not log in with invalid credentials', async ({ page }) => {
    await page.goto('/basic_auth');
    await expect(page.locator('body')).not.toContainText('Congratulations! You must have the proper credentials.');
  });
});

// This describe block is for tests that require successful authentication.
test.describe('Basic Auth - Authenticated', () => {
  // The 'page.authenticate()' method has been deprecated.
  // The modern approach is to use 'httpCredentials' in 'test.use()'.
  // This sets up authentication for all tests within this describe block.
  test.use({
    httpCredentials: {
      username: 'admin',
      password: 'admin',
    },
  });

  // Test for successful login using httpCredentials
  test('should successfully log in with valid credentials', async ({ page }) => {
    // Navigate to the Basic Auth page.
    // The credentials from test.use() will be automatically used.
    // Navigate using the relative path, leveraging the baseURL from playwright.config.ts
    await page.goto('/basic_auth');

    // Expect a success message after successful login
    await expect(page.locator('body')).toContainText('Congratulations! You must have the proper credentials.');
  });
});