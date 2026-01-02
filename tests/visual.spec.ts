import { test, expect } from '@playwright/test';

/**
 * Note: Screenshots from toHaveScreenshot() are automatically:
 * 1. Attached to the HTML test report (visible even when tests pass)
 * 2. When tests fail, Playwright automatically generates:
 *    - baseline.png (expected image)
 *    - actual.png (current screenshot)
 *    - diff.png (differences highlighted in red)
 * 
 * View the HTML report: npx playwright show-report
 */

/**
 * Visual Regression Test Suite
 * 
 * These tests capture screenshots and compare them against baseline images.
 * Baseline images are stored in tests/visual.spec.ts-snapshots/
 * 
 * To update baselines: npx playwright test --update-snapshots
 */

test.describe('Visual Regression Tests', () => {
  
  test('Add/Remove Elements page - full page screenshot', async ({ page }) => {
    await page.goto('add_remove_elements/');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot and attach it to the test report (always visible)
    const screenshot = await page.screenshot({ fullPage: true });
    await test.info().attach('screenshot', {
      body: screenshot,
      contentType: 'image/png',
    });
    
    // Take full page screenshot and compare with baseline
    // Note: This test runs across ALL projects (desktop browsers, mobile devices, tablets),
    // so it automatically covers different viewports:
    // - Desktop: 1280x720 or 1920x1080 (depending on device preset)
    // - Mobile: 390x844, 393x851, 412x915, etc. (iPhone/Pixel viewports)
    // - Tablet: 810x1080, 1024x1366 (iPad viewports)
    // Each project will have its own baseline image based on its native viewport.
    // When test fails, Playwright automatically generates:
    // - baseline.png (expected image)
    // - actual.png (current screenshot)
    // - diff.png (differences highlighted in red)
    await expect(page).toHaveScreenshot('add-remove-elements-full.png', {
      fullPage: true,
    });
  });

  test('Add/Remove Elements - after adding elements', async ({ page }) => {
    await page.goto('add_remove_elements/');
    await page.waitForLoadState('networkidle');
    
    // Add 3 elements
    const addButton = page.getByRole('button', { name: 'Add Element' });
    await addButton.click();
    await addButton.click();
    await addButton.click();
    
    // Wait for elements to be added
    await page.waitForTimeout(500);
    
    // Take a screenshot and attach it to the test report (always visible)
    const screenshot = await page.screenshot({ fullPage: true });
    await test.info().attach('screenshot', {
      body: screenshot,
      contentType: 'image/png',
    });
    
    // Capture full page screenshot with elements added
    // Note: This captures all elements (Add button, Delete buttons) in context,
    // so individual element screenshots are not needed.
    // When test fails, Playwright automatically generates:
    // - baseline.png (expected image)
    // - actual.png (current screenshot)
    // - diff.png (differences highlighted in red)
    await expect(page).toHaveScreenshot('add-remove-elements-with-elements.png', {
      fullPage: true,
    });
  });
});


