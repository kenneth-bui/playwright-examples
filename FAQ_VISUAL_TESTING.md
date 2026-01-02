# Visual Testing FAQ

## Question 1: Do visual tests cause layout issues?

**Answer: No, visual tests are completely read-only and do NOT cause any layout issues.**

### Why:
- Visual tests only **capture screenshots** - they don't modify the page
- They use `toHaveScreenshot()` which is a **comparison assertion**, not a page modification
- The page is rendered normally, then a screenshot is taken
- No JavaScript injection that affects layout (except our normalization CSS which only affects font rendering)

### What visual tests do:
1. ✅ Navigate to page
2. ✅ Wait for page to load
3. ✅ Take a screenshot
4. ✅ Compare screenshot with baseline image
5. ✅ Report pass/fail

### What visual tests DON'T do:
- ❌ Modify DOM
- ❌ Change CSS
- ❌ Inject scripts that affect layout
- ❌ Interfere with page functionality

**Conclusion**: Visual tests are safe and won't cause any layout issues.

---

## Question 2: Will visual tests fail locally on macOS if baselines are from Linux?

**Answer: It depends on the rendering differences, but with current settings, they should pass.**

### Current Protection Settings:

```typescript
toHaveScreenshot: { 
  threshold: 0.3,        // 30% of pixels can differ
  maxDiffPixels: 1000,   // Max 1000 pixels can differ
}
```

### What This Means:

- **If differences are small** (< 30% or < 1000 pixels): ✅ Tests will **PASS** on macOS
- **If differences are large** (> 30% or > 1000 pixels): ❌ Tests will **FAIL** on macOS

### Typical OS Differences:

Most OS rendering differences are usually:
- **Small**: Font rendering, anti-aliasing (usually < 5% difference)
- **Medium**: Subpixel rendering, text positioning (usually 5-15% difference)
- **Large**: Different fonts, layout shifts (rare, > 20% difference)

### Recommendations:

#### Option A: Run Visual Tests Only in CI (Recommended for Production)

If you want to avoid local failures:

```bash
# Don't run visual tests locally
# Only run them in CI where baselines were generated

# In CI workflow:
- name: Run Visual tests (all projects)
  run: npx playwright test visual
```

**Pros**: 
- No local failures
- Tests always run in consistent environment
- Baselines always match test environment

**Cons**:
- Can't test visual changes locally before pushing

#### Option B: Increase Threshold for Local Development

If you want to run locally, increase threshold:

```typescript
toHaveScreenshot: { 
  threshold: 0.4,        // 40% difference allowed
  maxDiffPixels: 2000,   // Allow more pixels
}
```

**Pros**: 
- Can test locally
- More forgiving of OS differences

**Cons**:
- Might miss real visual bugs
- Less strict validation

#### Option C: Generate Separate Baselines (Not Recommended)

Generate baselines for both macOS and Linux:

```typescript
snapshotPathTemplate: '{testDir}/{testFilePath}-snapshots/{arg}-{projectName}-{platform}{ext}',
```

**Pros**: 
- Perfect match on both OS

**Cons**:
- More baseline files to maintain
- Defeats purpose of OS-agnostic testing

#### Option D: Current Approach (Recommended)

- Generate baselines on Linux CI
- Use threshold 0.3 + maxDiffPixels 1000
- Accept that local tests might occasionally fail with large differences
- Review failures - if they're just OS rendering, it's expected

### Best Practice Workflow:

1. **Generate baselines on Linux CI** (using the workflow)
2. **Pull baselines to local**
3. **Run visual tests locally** - they should pass with current settings
4. **If they fail locally**: 
   - Check if it's just OS rendering (small text differences)
   - If yes, it's expected - tests will pass in CI
   - If no, it might be a real bug - investigate
5. **Always verify in CI** - CI is the source of truth

### Summary:

- **Visual tests are safe** - they don't cause layout issues ✅
- **Local tests might fail** if OS differences are large, but current settings (0.3 threshold, 1000 maxDiffPixels) should handle most cases ✅
- **CI is source of truth** - if tests pass in CI, that's what matters ✅

