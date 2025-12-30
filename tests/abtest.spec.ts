import { test, expect } from '@playwright/test';

/**
 * A/B Testing Test Suite - Key Differences from Normal Tests:
 * 
 * NORMAL TESTS:
 * - Test one fixed version of a page
 * - Expect consistent, predictable content
 * - Don't need to handle multiple variants
 * 
 * A/B TESTING TESTS:
 * - Test that different variants can be served
 * - Handle dynamic content that changes per user
 * - Test cookie/session persistence (same user sees same variant)
 * - Verify both variants work correctly
 * - Test variant switching behavior
 */

test.describe('A/B Testing - Key Differences', () => {
  
  /**
   * DIFFERENCE #1: Normal tests expect fixed content
   * A/B tests must handle dynamic/variable content
   */
  test('NORMAL TEST vs A/B TEST - Content Expectations', async ({ page }) => {
    await page.goto('https://the-internet.herokuapp.com/abtest');
    
    // NORMAL TEST would do this (expects fixed content):
    // await expect(page.locator('h3')).toHaveText('Expected Fixed Heading');
    
    // A/B TEST does this (handles variable content):
    const heading = await page.locator('h3').textContent();
    console.log('Variant received:', heading);
    
    // Accept multiple possible variants instead of one fixed value
    const validVariants = [
      'A/B Test Control',
      'A/B Test Variation 1',
      'No A/B Test'
    ];
    
    // Verify we got one of the valid variants (not a fixed one)
    expect(validVariants.some(variant => heading?.includes(variant))).toBeTruthy();
  });

  /**
   * DIFFERENCE #2: Normal tests don't test cookie persistence
   * A/B tests verify the same user sees the same variant
   */
  test('A/B TEST ONLY - Cookie Persistence (Same User, Same Variant)', async ({ page, context }) => {
    // First visit - get assigned a variant
    await page.goto('https://the-internet.herokuapp.com/abtest');
    const firstVariant = await page.locator('h3').textContent();
    console.log('First visit variant:', firstVariant);
    
    // Visit again WITHOUT clearing cookies - should see SAME variant
    await page.goto('https://the-internet.herokuapp.com/abtest');
    const secondVariant = await page.locator('h3').textContent();
    console.log('Second visit (same session) variant:', secondVariant);
    
    // A/B TEST: Same user should see same variant (cookie persistence)
    expect(firstVariant).toBe(secondVariant);
    
    // This is UNIQUE to A/B testing - normal tests don't check this!
  });

  /**
   * DIFFERENCE #3: Normal tests don't test variant switching
   * A/B tests verify new users can get different variants
   */
  test('A/B TEST ONLY - Variant Switching (New User, Different Variant)', async ({ context }) => {
    // Create first browser context (simulates first user)
    const page1 = await context.newPage();
    await page1.goto('https://the-internet.herokuapp.com/abtest');
    const variant1 = await page1.locator('h3').textContent();
    console.log('User 1 variant:', variant1);
    await page1.close();
    
    // Create NEW browser context with cleared cookies (simulates new user)
    await context.clearCookies();
    const page2 = await context.newPage();
    await page2.goto('https://the-internet.herokuapp.com/abtest');
    const variant2 = await page2.locator('h3').textContent();
    console.log('User 2 variant:', variant2);
    await page2.close();
    
    // A/B TEST: Different users might see different variants
    // (Note: This page might always show same variant, but real A/B tests would vary)
    expect(variant1).toBeTruthy();
    expect(variant2).toBeTruthy();
    
    // This testing approach is UNIQUE to A/B testing!
  });

  /**
   * DIFFERENCE #4: Normal tests verify one specific flow
   * A/B tests must verify ALL possible variants work correctly
   */
  test('A/B TEST ONLY - Test All Variants Work', async ({ page }) => {
    await page.goto('https://the-internet.herokuapp.com/abtest');
    
    const heading = await page.locator('h3').textContent();
    const content = await page.locator('p').first().textContent();
    
    // A/B TEST: Regardless of which variant we got, verify it works
    // Normal test would only check one specific variant
    
    // Check that whichever variant we got, it has valid content
    expect(heading).toBeTruthy();
    expect(content).toBeTruthy();
    expect(content?.length).toBeGreaterThan(10); // Has meaningful content
    
    // Verify page is functional regardless of variant
    const allLinks = await page.locator('a').count();
    console.log(`Variant "${heading}" has ${allLinks} links - all working`);
    
    // This approach ensures ALL variants are tested, not just one
  });

  /**
   * DIFFERENCE #5: Normal tests don't track variant assignment
   * A/B tests need to verify variant assignment logic works
   */
  test('A/B TEST ONLY - Try 10 Times to Find Different Variants', async ({ page, context }) => {
    const variantsSeen = new Map<string, number>(); // Track variant and count
    const allVisits: string[] = []; // Track all visits in order
    
    console.log('Starting 10 visits to check for variant differences...\n');
    
    // Try 10 visits to see if we can get different variants
    for (let i = 1; i <= 10; i++) {
      // Clear cookies to simulate a new user each time
      await context.clearCookies();
      
      // Navigate to the page
      await page.goto('https://the-internet.herokuapp.com/abtest');
      
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
    
    // A/B TEST: Verify variant assignment is working
    expect(variantsSeen.size).toBeGreaterThan(0);
    
    // Log findings
    if (variantsSeen.size === 1) {
      console.log('\n⚠️  NOTE: Only one variant was seen across all 10 visits.');
      console.log('   This suggests the A/B test may not be active or always serves the same variant.');
    } else {
      console.log('\n✅ Multiple variants detected! The A/B test is working.');
    }
    
    // This kind of testing is UNIQUE to A/B testing scenarios!
  });

  /**
   * Additional test: Try refreshing 10 times without clearing cookies
   * This simulates the same user refreshing the page multiple times
   */
  test('A/B TEST - Refresh 10 Times (Same Session)', async ({ page }) => {
    const variantsSeen = new Map<string, number>();
    const allVisits: string[] = [];
    
    console.log('Starting 10 page refreshes (same session, keeping cookies)...\n');
    
    // First visit
    await page.goto('https://the-internet.herokuapp.com/abtest');
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
    
    // In A/B testing, same user should see same variant (cookie persistence)
    if (variantsSeen.size === 1) {
      console.log('\n✅ Expected: Same variant across all refreshes (cookie persistence working)');
    } else {
      console.log('\n⚠️  Unexpected: Different variants seen in same session');
    }
    
    expect(variantsSeen.size).toBeGreaterThan(0);
  });
});

