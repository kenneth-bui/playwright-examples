# Handling OS Rendering Differences (macOS vs Linux)

Visual regression tests can fail due to OS-specific rendering differences between macOS (local) and Linux (CI). This guide explains the issue and solutions.

## Why This Happens

Different operating systems render web content slightly differently due to:

1. **Font Rendering**: Different default fonts and font rendering engines
2. **Anti-aliasing**: Different subpixel rendering techniques
3. **Text Rendering**: OS-specific text smoothing algorithms
4. **DPI/Scaling**: Different pixel density handling

## Solutions Implemented

### 1. Increased Threshold ✅
- **Current**: `threshold: 0.3` (30% pixel difference allowed)
- **Previous**: `threshold: 0.2` (20%)
- **Benefit**: Allows minor OS rendering differences without failing tests

### 2. Max Diff Pixels ✅
- **Current**: `maxDiffPixels: 1000`
- **Benefit**: Limits total number of pixels that can differ, regardless of percentage

### 3. Font Rendering Normalization ✅
- Added CSS injection to normalize font smoothing
- Reduces differences in text rendering across OS

## Additional Solutions (If Needed)

### Option 1: Generate Baselines on Linux CI (Recommended)

**Best Practice**: Generate baseline images on the same OS where tests run (Linux CI).

#### Method 1: Manual Workflow Trigger (Easiest)

1. **Go to GitHub Actions** → Your repository → Actions tab
2. **Select "Generate Visual Test Baselines (Linux CI)"** workflow
3. **Click "Run workflow"** → Select branch → Run
4. **Wait for completion** - The workflow will:
   - Generate baselines on Linux
   - Automatically commit them to your repo
   - Upload them as artifacts

#### Method 2: Push to Trigger

The workflow also triggers when you push changes to:
- `tests/visual.spec.ts`
- `playwright.config.ts`

#### Method 3: Download and Commit Manually

If you prefer manual control:

1. **Trigger the workflow** (Method 1 or 2)
2. **Download the artifact** from the workflow run
3. **Extract and commit**:
   ```bash
   # Extract the artifact
   unzip visual-baselines-linux.zip
   
   # Copy to your repo
   cp -r visual.spec.ts-snapshots/ tests/
   
   # Commit
   git add tests/visual.spec.ts-snapshots/
   git commit -m "Update baselines from Linux CI"
   git push
   ```

**Pros**: 
- Most accurate - baselines match CI environment
- No threshold adjustments needed
- Catches real issues
- Automated workflow handles everything

**Cons**:
- Can't preview baselines locally on macOS (but you can download them)

### Option 2: Use Masking for Specific Areas

If only certain areas differ (e.g., footer text), mask those areas:

```typescript
await expect(page).toHaveScreenshot('add-remove-elements-full.png', {
  fullPage: true,
  mask: [
    page.locator('footer'), // Mask footer if it has OS-specific rendering
  ],
});
```

### Option 3: Increase Threshold Further

If differences are still too large:

```typescript
toHaveScreenshot: { 
  threshold: 0.4, // 40% difference allowed
  maxDiffPixels: 2000, // Allow more pixels to differ
}
```

### Option 4: Use Pixel Ratio Normalization

Normalize device pixel ratio:

```typescript
await page.addInitScript(() => {
  Object.defineProperty(window, 'devicePixelRatio', {
    get: () => 1, // Force 1x DPI
  });
});
```

### Option 5: Load Specific Fonts

Force specific fonts to be used:

```typescript
await page.addStyleTag({
  content: `
    * {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
    }
  `
});
```

## Current Configuration

```typescript
expect: {
  toHaveScreenshot: { 
    threshold: 0.3,        // 30% pixel difference allowed
    maxDiffPixels: 1000,   // Max 1000 pixels can differ
    animations: 'disabled',
  },
}
```

## Recommendation

1. **Short term**: Current settings (threshold 0.3 + maxDiffPixels 1000) should handle most OS differences
2. **Long term**: Generate baselines on Linux CI for most accurate results
3. **If still failing**: Use masking for specific problematic areas

## Testing

After updating settings, regenerate baselines:

```bash
npm run test:visual:update
```

Then run tests to verify OS differences are handled:

```bash
npm run test:visual
```

