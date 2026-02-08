import { test, expect } from '@playwright/test';

test.describe('Broken Images', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the broken images page
    await page.goto('/broken_images');
  });

  test('should have the correct title and header', async ({ page }) => {
    await expect(page).toHaveTitle('The Internet');
    await expect(page.locator('h3')).toHaveText('Broken Images');
  });

  test('should identify and list all broken images', async ({ page, request }) => {
    // Get all image elements in the example container
    const images = page.locator('div.example img');
    const count = await images.count();
    
    console.log(`Found ${count} images to check.`);

    const brokenImagesFound: any[] = [];

    for (let i = 0; i < count; i++) {
      const image = images.nth(i);
      const src = await image.getAttribute('src');
      
      const issues: string[] = [];

      let status = 0;
      let isBrokenVisual = false;

      if (src) {
        // 2. Network Check: Verify the HTTP status code
        const response = await request.get(src);
        status = response.status();
        if (status !== 200) {
          issues.push(`Network error (HTTP ${status})`);
        }

        // 3. Visual Check: naturalWidth
        isBrokenVisual = await image.evaluate((img: HTMLImageElement) => {
          return img.naturalWidth === 0;
        });
        if (isBrokenVisual) {
          issues.push('Visual error (naturalWidth is 0)');
        }
      } else {
        issues.push('Missing src attribute');
      }

      if (issues.length > 0) {
        brokenImagesFound.push({
          index: i + 1,
          src: src || 'N/A',
          issues: issues.join(', ')
        });
      }
    }

    // Final Reporting
    if (brokenImagesFound.length > 0) {
      console.log('\n--- BROKEN IMAGES REPORT ---');
      brokenImagesFound.forEach(img => {
        console.log(`Image #${img.index} | SRC: ${img.src} | Issues: ${img.issues}`);
      });
      console.log('----------------------------\n');
    }

    // Assert that no broken images were found
    expect(brokenImagesFound, `Found ${brokenImagesFound.length} broken images:\n${JSON.stringify(brokenImagesFound, null, 2)}`).toHaveLength(0);
  });

  test('all images should load within a specific threshold', async ({ page }) => {
    const maxLoadTimeMs = 2000; // Threshold in milliseconds
    const images = page.locator('div.example img');
    const count = await images.count();
    
    const performanceReport: any[] = [];

    for (let i = 0; i < count; i++) {
      const image = images.nth(i);
      
      // We use page.evaluate to get the absolute URL and performance timing
      const performanceData = await image.evaluate(async (img: HTMLImageElement) => {
        const imgSrc = img.currentSrc;
        // Find the performance entry for this specific absolute URL
        const entry = performance.getEntriesByName(imgSrc, 'resource')[0] as PerformanceResourceTiming;
        
        // Check if the image loaded successfully (visual check)
        const isLoaded = img.naturalWidth > 0;
        
        return {
          src: imgSrc,
          duration: entry ? entry.duration : null,
          isLoaded: isLoaded
        };
      });

      const { src, duration, isLoaded } = performanceData;

      if (isLoaded && duration !== null) {
        if (duration > maxLoadTimeMs) {
          performanceReport.push({
            index: i + 1,
            src: src,
            loadTime: `${duration.toFixed(2)}ms`
          });
        }
      } else if (!isLoaded) {
        console.warn(`Skipping performance check for broken image: ${src}`);
      } else {
        console.warn(`Could not find performance data for image: ${src}`);
      }
    }

    if (performanceReport.length > 0) {
      console.log(`\n--- IMAGE LOAD PERFORMANCE REPORT (Threshold: ${maxLoadTimeMs}ms) ---`);
      performanceReport.forEach(item => {
        console.log(`Image #${item.index} | Time: ${item.loadTime} | SRC: ${item.src}`);
      });
      console.log('------------------------------------------------------\n');
    }

    expect(performanceReport, `Found ${performanceReport.length} images that took longer than ${maxLoadTimeMs}ms to load.`).toHaveLength(0);
  });
});
