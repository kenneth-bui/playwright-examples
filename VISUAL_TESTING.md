# Visual Regression Testing Guide

This project uses Playwright's built-in visual comparison feature for visual regression testing.

## Quick Start

### 1. Run Visual Tests
```bash
npm run test:visual
```

### 2. Update Baseline Images
When you make intentional UI changes, update the baseline images:
```bash
npm run test:visual:update
```

### 3. Run with UI Mode
To see visual comparisons interactively:
```bash
npm run test:visual:ui
```

## How It Works

1. **Baseline Images**: Stored in `tests/visual.spec.ts-snapshots/`
   - These are the "expected" screenshots
   - Commit these to your repository

2. **Actual Screenshots**: Generated during test runs
   - Compared pixel-by-pixel against baselines
   - Stored in `test-results/` (gitignored)

3. **Comparison**: Playwright compares actual vs baseline
   - Threshold: 0.2 (20% pixel difference allowed)
   - Mode: 'strict' (exact pixel matching)

## Test Structure

Visual tests are in `tests/visual.spec.ts`:

- **Full page screenshots**: Capture entire page
- **Viewport screenshots**: Capture visible area only
- **Element screenshots**: Capture specific elements
- **Responsive screenshots**: Test different viewport sizes

## Workflow

### First Time Setup
1. Write your visual test
2. Run `npm run test:visual:update` to create baseline images
3. Commit the baseline images to git

### Regular Testing
1. Run `npm run test:visual`
2. If tests fail, review the diff images in `test-results/`
3. If changes are intentional, update baselines: `npm run test:visual:update`

### Handling Failures

When a visual test fails:
1. Check the diff image in `test-results/` folder
2. If the change is **intentional** (design update):
   ```bash
   npm run test:visual:update
   ```
3. If the change is **unintentional** (bug):
   - Fix the bug
   - Re-run tests

## Configuration

Visual comparison settings are in `playwright.config.ts`:

```typescript
expect: {
  toHaveScreenshot: { threshold: 0.2, mode: 'strict' },
  toMatchSnapshot: { threshold: 0.2 },
}
```

- **threshold**: 0-1, percentage of pixels that can differ (0.2 = 20%)
- **mode**: 'strict' (exact) or 'pixel' (pixel-perfect)

## Tips

1. **Stable Tests**: Wait for page to load completely before taking screenshots
   ```typescript
   await page.waitForLoadState('networkidle');
   ```

2. **Dynamic Content**: Hide or mock dynamic content (timestamps, random data)

3. **Animations**: Wait for animations to complete before capturing

4. **Multiple Viewports**: Test responsive designs across different screen sizes

5. **Element Screenshots**: Use for testing specific components

## CI/CD Integration

Visual tests run automatically in CI. If baselines need updating:
1. Update baselines locally: `npm run test:visual:update`
2. Commit the updated baseline images
3. Push to trigger CI

## Best Practices

- ✅ Commit baseline images to version control
- ✅ Review diffs carefully before updating baselines
- ✅ Use descriptive screenshot names
- ✅ Test critical user flows visually
- ✅ Keep threshold reasonable (0.2 is a good default)
- ❌ Don't ignore visual test failures
- ❌ Don't update baselines without reviewing changes


