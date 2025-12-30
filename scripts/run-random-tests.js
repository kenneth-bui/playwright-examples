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

// Build the playwright command with selected projects
const projectArgs = selectedProjects.map(p => `--project="${p}"`).join(' ');
const command = `npx playwright test ${projectArgs}`;

console.log(`Running: ${command}\n`);

// Execute the command
try {
  execSync(command, { stdio: 'inherit' });
  process.exit(0);
} catch (error) {
  process.exit(1);
}

