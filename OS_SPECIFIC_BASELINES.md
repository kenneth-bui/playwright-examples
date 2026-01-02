# OS-Specific Visual Test Baselines

## Overview

Visual test baselines are now stored in **separate folders per operating system** to account for OS-specific rendering differences (fonts, anti-aliasing, subpixel rendering, etc.).

## Folder Structure

Baselines are organized by OS platform:

```
tests/
  visual.spec.ts-snapshots-darwin/     # macOS baselines
    add-remove-elements-full-chromium.png
    add-remove-elements-full-firefox.png
    ...
  visual.spec.ts-snapshots-linux/      # Linux CI baselines
    add-remove-elements-full-chromium.png
    add-remove-elements-full-firefox.png
    ...
  visual.spec.ts-snapshots-win32/      # Windows baselines (if needed)
    ...
```

## Platform Values

Playwright uses the following platform identifiers:
- `darwin` - macOS
- `linux` - Linux (used in CI)
- `win32` - Windows

## Benefits

1. **Accurate Comparisons**: Each OS compares against its own baseline, reducing false positives
2. **OS-Specific Testing**: Can catch OS-specific rendering issues
3. **Flexible Thresholds**: Can use stricter thresholds since baselines are OS-matched
4. **Clear Organization**: Easy to see which baselines belong to which OS

## Generating Baselines

### macOS (Local Development)

```bash
# Generate/update macOS baselines locally
npm run test:visual:update
```

This creates/updates files in `tests/visual.spec.ts-snapshots-darwin/`

### Linux (CI)

Use the GitHub Actions workflow:
1. Go to **Actions** → **Generate Visual Test Baselines (Linux CI)**
2. Click **Run workflow**
3. Select branch (usually `main`)
4. The workflow will generate Linux baselines and commit them automatically

Or trigger via push to `visual.spec.ts` or `playwright.config.ts`:

```bash
git add tests/visual.spec.ts
git commit -m "Update visual tests"
git push origin main
```

This creates/updates files in `tests/visual.spec.ts-snapshots-linux/`

## Running Tests

### Local (macOS)

```bash
# Run visual tests on macOS
npm run test:visual
```

Tests will compare against `tests/visual.spec.ts-snapshots-darwin/` baselines.

### CI (Linux)

Visual tests in CI automatically compare against `tests/visual.spec.ts-snapshots-linux/` baselines.

## Configuration

The `snapshotPathTemplate` in `playwright.config.ts` includes `{platform}`:

```typescript
snapshotPathTemplate: '{testDir}/{testFilePath}-snapshots-{platform}/{arg}-{projectName}{ext}'
```

This automatically creates OS-specific folders based on where tests run.

## Migration from OS-Agnostic Baselines

If you previously had OS-agnostic baselines (without `-darwin` or `-linux` suffix):

1. **Option 1: Regenerate all baselines** (Recommended)
   - Delete old baseline folders
   - Generate new baselines on macOS: `npm run test:visual:update`
   - Generate new baselines on Linux CI via workflow

2. **Option 2: Rename existing baselines**
   ```bash
   # On macOS
   mv tests/visual.spec.ts-snapshots tests/visual.spec.ts-snapshots-darwin
   
   # On Linux CI (or manually)
   mv tests/visual.spec.ts-snapshots tests/visual.spec.ts-snapshots-linux
   ```

## Threshold Settings

Since baselines are now OS-specific, you may want to use stricter thresholds:

```typescript
expect: {
  toHaveScreenshot: { 
    threshold: 0.2,  // Can be stricter (was 0.3 for OS-agnostic)
    maxDiffPixels: 500,  // Can be lower (was 1000)
  },
}
```

However, some tolerance is still recommended for:
- Browser version differences
- Minor rendering variations
- Timing-related differences

## Best Practices

1. **Generate baselines on the same OS where tests run**
   - macOS baselines for local development
   - Linux baselines for CI

2. **Keep both baseline sets in version control**
   - Allows developers to test locally on macOS
   - CI runs against Linux baselines

3. **Update baselines when UI changes**
   - Update macOS baselines locally
   - Update Linux baselines via CI workflow

4. **Review baseline changes carefully**
   - Ensure changes are intentional (UI updates)
   - Not due to rendering bugs

