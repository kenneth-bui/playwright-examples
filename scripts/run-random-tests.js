#!/usr/bin/env node

/**
 * Random Test Selection Script
 * 
 * Randomly selects one project from each category:
 * - One desktop browser (chromium, firefox, edge, webkit)
 * - One mobile Safari (iPhone variants)
 * - One mobile Chrome (Android variants)
 * - One tablet (iPad variants)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Parse playwright.config.ts to extract project names and categorize them
 */
function parseProjectsFromConfig() {
  const configPath = path.join(__dirname, '..', 'playwright.config.ts');
  const configContent = fs.readFileSync(configPath, 'utf8');
  
  // Extract project names using regex
  // Matches: name: 'project-name' or name: "project-name"
  const projectNameRegex = /name:\s*['"]([^'"]+)['"]/g;
  const projects = [];
  let match;
  
  while ((match = projectNameRegex.exec(configContent)) !== null) {
    projects.push(match[1]);
  }
  
  // Categorize projects based on naming patterns
  const desktopBrowsers = projects.filter(name => {
    const lowerName = name.toLowerCase();
    // Desktop browsers are typically: chromium, firefox, edge, safari, webkit
    // and don't contain "mobile" or "tablet"
    return !lowerName.includes('mobile') && 
           !lowerName.includes('tablet') &&
           (lowerName === 'chromium' || 
            lowerName === 'firefox' || 
            lowerName === 'edge' || 
            lowerName === 'safari' || 
            lowerName === 'webkit');
  });
  
  const mobileSafari = projects.filter(name => 
    name.startsWith('Mobile Safari')
  );
  
  const mobileChrome = projects.filter(name => 
    name.startsWith('Mobile Chrome')
  );
  
  const tablets = projects.filter(name => 
    name.startsWith('Tablet')
  );
  
  return {
    desktopBrowsers,
    mobileSafari,
    mobileChrome,
    tablets
  };
}

// Dynamically get project categories from playwright.config.ts
const projectCategories = parseProjectsFromConfig();
const desktopBrowsers = projectCategories.desktopBrowsers;
const mobileSafari = projectCategories.mobileSafari;
const mobileChrome = projectCategories.mobileChrome;
const tablets = projectCategories.tablets;

// Validate that we have at least one desktop browser (required)
if (desktopBrowsers.length === 0) {
  console.error('❌ No desktop browsers found in playwright.config.ts');
  process.exit(1);
}

// Warn about missing optional categories
if (mobileSafari.length === 0) {
  console.warn('⚠️  No mobile Safari projects found in playwright.config.ts');
}
if (mobileChrome.length === 0) {
  console.warn('⚠️  No mobile Chrome projects found in playwright.config.ts');
}
if (tablets.length === 0) {
  console.warn('⚠️  No tablet projects found in playwright.config.ts');
}

// Random selection function
function randomSelect(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Select one random project from each category (only if category has projects)
const selectedDesktop = randomSelect(desktopBrowsers);
const selectedMobileSafari = mobileSafari.length > 0 ? randomSelect(mobileSafari) : null;
const selectedMobileChrome = mobileChrome.length > 0 ? randomSelect(mobileChrome) : null;
const selectedTablet = tablets.length > 0 ? randomSelect(tablets) : null;

// Build the project list (only include categories that have projects)
const selectedProjects = [selectedDesktop];
if (selectedMobileSafari) selectedProjects.push(selectedMobileSafari);
if (selectedMobileChrome) selectedProjects.push(selectedMobileChrome);
if (selectedTablet) selectedProjects.push(selectedTablet);

// Log available projects
console.log('📋 Available Projects (from playwright.config.ts):');
console.log(`   Desktop Browsers: ${desktopBrowsers.join(', ')}`);
console.log(`   Mobile Safari: ${mobileSafari.length > 0 ? mobileSafari.join(', ') : 'None'}`);
console.log(`   Mobile Chrome: ${mobileChrome.length > 0 ? mobileChrome.join(', ') : 'None'}`);
console.log(`   Tablets: ${tablets.length > 0 ? tablets.join(', ') : 'None'}`);
console.log('');

// Log the selections
console.log('🎲 Randomly Selected Projects:');
console.log(`   Desktop Browser: ${selectedDesktop}`);
if (mobileSafari.length > 0) {
  console.log(`   Mobile Safari: ${selectedMobileSafari}`);
}
if (mobileChrome.length > 0) {
  console.log(`   Mobile Chrome: ${selectedMobileChrome}`);
}
if (tablets.length > 0) {
  console.log(`   Tablet: ${selectedTablet}`);
}
console.log('');

// Automatically discover all test files, excluding visual.spec.ts
const testsDir = path.join(__dirname, '..', 'tests');
const allTestFiles = fs.readdirSync(testsDir)
  .filter(file => file.endsWith('.spec.ts') && file !== 'visual.spec.ts')
  .map(file => path.join('tests', file));

if (allTestFiles.length === 0) {
  console.error('❌ No test files found (excluding visual.spec.ts)');
  process.exit(1);
}

// Build the playwright command with selected projects
// Exclude visual tests - they should run on all projects separately
const projectArgs = selectedProjects.map(p => `--project="${p}"`).join(' ');
const testFiles = allTestFiles.join(' ');
const command = `npx playwright test ${projectArgs} ${testFiles}`;

console.log('📁 Test files included:');
allTestFiles.forEach(file => console.log(`   - ${file}`));
console.log('');

console.log(`Running: ${command}\n`);
console.log('Note: Visual tests (visual.spec.ts) are excluded from random selection.');
console.log('Visual tests should run separately on all projects for comprehensive coverage.\n');

// Execute the command
try {
  execSync(command, { stdio: 'inherit' });
  process.exit(0);
} catch (error) {
  process.exit(1);
}

