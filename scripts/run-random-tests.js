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

// Define project categories
const desktopBrowsers = ['chromium', 'firefox', 'edge', 'webkit'];
const mobileSafari = [
  'Mobile Safari - iPhone 12',
  'Mobile Safari - iPhone 13',
  'Mobile Safari - iPhone 14',
  'Mobile Safari - iPhone SE'
];
const mobileChrome = [
  'Mobile Chrome - Pixel 5',
  'Mobile Chrome - Pixel 7',
  'Mobile Chrome - Galaxy S9+'
];
const tablets = [
  'Tablet - iPad',
  'Tablet - iPad Pro'
];

// Random selection function
function randomSelect(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Select one random project from each category
const selectedDesktop = randomSelect(desktopBrowsers);
const selectedMobileSafari = randomSelect(mobileSafari);
const selectedMobileChrome = randomSelect(mobileChrome);
const selectedTablet = randomSelect(tablets);

// Build the project list
const selectedProjects = [
  selectedDesktop,
  selectedMobileSafari,
  selectedMobileChrome,
  selectedTablet
];

// Log the selections
console.log('🎲 Randomly Selected Projects:');
console.log(`   Desktop Browser: ${selectedDesktop}`);
console.log(`   Mobile Safari: ${selectedMobileSafari}`);
console.log(`   Mobile Chrome: ${selectedMobileChrome}`);
console.log(`   Tablet: ${selectedTablet}`);
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

