import { test, expect } from '@playwright/test';

/**
 * A/B Testing Test Suite
 * 
 * These tests demonstrate how to test A/B testing scenarios with Playwright.
 * The key difference from normal tests: A/B tests serve different content to different users,
 * and use cookies to ensure the same user always sees the same variant.
 */

test.describe('A/B Testing', () => {
  
  /**
   * Test 1: Try 10 times with cookies cleared (simulating new users)
   * 
   * Purpose: Check if different variants can be served to different users.
   * By clearing cookies before each visit, we simulate a new user each time,
   * which gives us a chance to see different A/B test variants.
   * 
   * Key: Clearing cookies = new user = potentially different variant
   */
  test('Try 10 Times to Find Different Variants (New Users)', async ({ page, context }) => {
    const variantsSeen = new Map<string, number>(); // Track variant and count
    const allVisits: string[] = []; // Track all visits in order
    
    console.log('Starting 10 visits to check for variant differences...\n');
    
    // Try 10 visits to see if we can get different variants
    for (let i = 1; i <= 10; i++) {
      // Clear cookies to simulate a new user each time
      await context.clearCookies();
      
      // Navigate to the page
      await page.goto('abtest');
      
      // Get the variant heading
      const variant = await page.locator('h3').textContent();
      const variantText = variant?.trim() || 'Unknown';
      
      // Track the variant
      variantsSeen.set(variantText, (variantsSeen.get(variantText) || 0) + 1);
      allVisits.push(variantText);
      
      console.log(`Visit ${i}: "${variantText}"`);
      
      // Small delay to avoid hammering the server
      await page.waitForTimeout(100);
    }
    
    // Print summary
    console.log('\n=== SUMMARY ===');
    console.log(`Total visits: ${allVisits.length}`);
    console.log(`Unique variants found: ${variantsSeen.size}`);
    console.log('\nVariant distribution:');
    variantsSeen.forEach((count, variant) => {
      const percentage = ((count / 10) * 100).toFixed(1);
      console.log(`  "${variant}": ${count} times (${percentage}%)`);
    });
    
    console.log('\nVisit sequence:');
    allVisits.forEach((variant, index) => {
      console.log(`  ${index + 1}. ${variant}`);
    });
    
    // A/B TEST: Verify that different variants can be served to different users
    // If only 1 variant is seen, the A/B test is not working properly
    expect(variantsSeen.size).toBeGreaterThan(1);
    
    // Log success message
    console.log('\n✅ Multiple variants detected! The A/B test is working correctly.');
  });

  /**
   * Test 2: Refresh 10 times without clearing cookies (same user)
   * 
   * Purpose: Verify cookie persistence - the same user should always see the same variant.
   * By NOT clearing cookies, we simulate the same user refreshing the page.
   * 
   * Key: Keeping cookies = same user = should see same variant (cookie persistence)
   */
  test('Refresh 10 Times (Same Session - Cookie Persistence)', async ({ page }) => {
    const variantsSeen = new Map<string, number>();
    const allVisits: string[] = [];
    
    console.log('Starting 10 page refreshes (same session, keeping cookies)...\n');
    
    // First visit
    await page.goto('abtest');
    let variant = await page.locator('h3').textContent();
    let variantText = variant?.trim() || 'Unknown';
    variantsSeen.set(variantText, 1);
    allVisits.push(variantText);
    console.log(`Initial visit: "${variantText}"`);
    
    // Refresh 9 more times (total 10 visits)
    for (let i = 2; i <= 10; i++) {
      await page.reload(); // Refresh without clearing cookies
      variant = await page.locator('h3').textContent();
      variantText = variant?.trim() || 'Unknown';
      variantsSeen.set(variantText, (variantsSeen.get(variantText) || 0) + 1);
      allVisits.push(variantText);
      console.log(`Refresh ${i}: "${variantText}"`);
      await page.waitForTimeout(100);
    }
    
    // Print summary
    console.log('\n=== REFRESH SUMMARY ===');
    console.log(`Total refreshes: ${allVisits.length}`);
    console.log(`Unique variants: ${variantsSeen.size}`);
    console.log('\nVariant distribution:');
    variantsSeen.forEach((count, variant) => {
      const percentage = ((count / 10) * 100).toFixed(1);
      console.log(`  "${variant}": ${count} times (${percentage}%)`);
    });
    
    // A/B TEST: Verify cookie persistence - same user should always see same variant
    // If more than 1 variant is seen, cookie persistence is not working
    expect(variantsSeen.size).toBe(1);
    
    // Log success message
    console.log('\n✅ Cookie persistence working: Same variant seen across all refreshes.');
  });
});

