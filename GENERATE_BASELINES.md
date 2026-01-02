# How to Generate Baselines on Linux CI from macOS

This guide explains how to generate visual test baselines on Linux CI (where your tests run) from your macOS local machine.

## Quick Start

### Method 1: Manual Workflow Trigger (Recommended)

1. **Push your code** to GitHub (if you have local changes)
2. **Go to GitHub** → Your repository → **Actions** tab
3. **Find "Generate Visual Test Baselines (Linux CI)"** workflow
4. **Click "Run workflow"** button (top right)
5. **Select your branch** (usually `main` or `master`)
6. **Click "Run workflow"**
7. **Wait for completion** - The workflow will:
   - Generate baselines on Linux CI
   - Automatically commit them to your repo
   - Upload them as artifacts (downloadable)

8. **Pull the changes** to your local machine:
   ```bash
   git pull origin main
   ```

### Method 2: Automatic Trigger

The workflow also automatically triggers when you push changes to:
- `tests/visual.spec.ts`
- `playwright.config.ts`

So if you update your visual tests, baselines will be regenerated automatically.

### Method 3: Download Artifacts Manually

If you want to review before committing:

1. **Trigger the workflow** (Method 1)
2. **Wait for completion**
3. **Download the artifact**:
   - Go to the workflow run
   - Scroll to "Artifacts" section
   - Download `visual-baselines-linux`
4. **Extract and use**:
   ```bash
   unzip visual-baselines-linux.zip
   # Review the files
   # Then copy to your repo if satisfied
   cp -r visual.spec.ts-snapshots/ tests/
   git add tests/visual.spec.ts-snapshots/
   git commit -m "Update baselines from Linux CI"
   git push
   ```

## Why Generate on Linux CI?

- **Accuracy**: Baselines match the exact environment where tests run
- **No OS differences**: Eliminates macOS vs Linux rendering differences
- **Reliability**: Tests will pass consistently in CI
- **No threshold adjustments**: Don't need to increase threshold to handle OS differences

## Workflow Details

The workflow (`generate-baselines.yml`) does:

1. ✅ Checks out your code
2. ✅ Installs dependencies and Playwright
3. ✅ Generates baselines: `npx playwright test visual --update-snapshots`
4. ✅ Commits baselines automatically (if changed)
5. ✅ Uploads baselines as downloadable artifact

## Troubleshooting

### Workflow doesn't have write permissions

If the commit step fails, you may need to:
1. Go to **Settings** → **Actions** → **General**
2. Under **Workflow permissions**, select **Read and write permissions**
3. Check **Allow GitHub Actions to create and approve pull requests**

### Baselines not committing

Check the workflow logs. The workflow will:
- Only commit if files actually changed
- Skip commit if baselines are identical

### Want to review before committing

Use Method 3 above - download artifacts, review, then commit manually.

## Best Practice Workflow

1. **Write/update visual tests** locally on macOS
2. **Push to GitHub**
3. **Trigger baseline generation workflow** on Linux CI
4. **Pull the generated baselines** to local
5. **Run tests locally** to verify everything works
6. **Commit and push** if everything looks good

This ensures baselines are always generated in the CI environment where tests actually run.

