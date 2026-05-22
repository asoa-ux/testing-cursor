#!/usr/bin/env node
/**
 * Static checks for toolbar tip helpers and known v3 contracts.
 * Run: npm run audit:toolbar
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INDEX = path.join(__dirname, '..', 'index.html');
const BLUEPRINT = path.join(__dirname, '..', 'TOOLTIP-BLUEPRINT.md');

const html = fs.readFileSync(INDEX, 'utf8');
const blueprint = fs.readFileSync(BLUEPRINT, 'utf8');

const errors = [];
const warnings = [];

function requirePattern(name, pattern, message) {
  if (!pattern.test(html)) {
    errors.push(`${name}: ${message}`);
  }
}

// Tip helpers referenced from update paths must exist
const requiredFunctions = [
  'function getWaAddDisabledTip',
  'function getWaItemActionDisabledTip',
  'function getWaDuplicateDisabledTip',
  'function getTabsAddDisabledTip',
  'function getTabsItemActionDisabledTip',
  'function getTabsDuplicateDisabledTip',
  'function getSvItemActionDisabledTip',
  'function getToolbarFilterDisabledTip',
  'function syncToolbarButtonTip',
  'function getHiddenByFiltersTip',
  'function ensureTabsTreeSelection',
  'function ensureWaTreeSelection',
];

for (const sig of requiredFunctions) {
  if (!html.includes(sig)) {
    errors.push(`Missing: ${sig}`);
  }
}

// v3: Specific views must not call undefined helper
requirePattern(
  'getSvItemActionDisabledTip-used',
  /getSvItemActionDisabledTip\(/,
  'Specific views toolbar must use getSvItemActionDisabledTip'
);

// v3: Actions tab uses null tips (no "Not available on this tab")
if (/Not available on this tab/.test(html)) {
  warnings.push('Found v2 phrase "Not available on this tab." — v3 should use null tips on Actions tab');
}

// Blueprint should mention v3-specific rules
const blueprintMarkers = [
  'Duplicate content to',
  'single-select',
  'getSvItemActionDisabledTip',
];
for (const marker of blueprintMarkers) {
  if (!blueprint.includes(marker)) {
    warnings.push(`TOOLTIP-BLUEPRINT.md missing marker: ${marker}`);
  }
}

if (!html.includes("syncToolbarButtonTip('btn-add', false, null)")) {
  warnings.push('Expected Actions-tab path to pass null tip for btn-add');
}

console.log('Toolbar rules audit (conf-tool-v3)\n');

if (warnings.length) {
  console.log('Warnings:');
  warnings.forEach((w) => console.log(`  ⚠ ${w}`));
  console.log('');
}

if (errors.length) {
  console.log('Errors:');
  errors.forEach((e) => console.log(`  ✗ ${e}`));
  process.exit(1);
}

console.log(`✓ ${requiredFunctions.length} required helpers present`);
console.log('✓ No blocking errors');
if (warnings.length) process.exit(0);
console.log('✓ No warnings');
