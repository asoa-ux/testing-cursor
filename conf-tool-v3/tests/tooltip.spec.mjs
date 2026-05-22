/**
 * Toolbar disabled-tooltip and enablement contracts (conf-tool-v3).
 * Run from conf-tool-v3: npx playwright test
 */
import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INDEX = path.join(__dirname, '..', 'index.html');

async function getDisabledTip(page, btnId) {
  return page
    .locator(`#${btnId}`)
    .locator('xpath=ancestor::span[contains(@class,"toolbar__item-wrap")]')
    .getAttribute('data-disabled-tip');
}

async function switchAppTab(page, tabId) {
  await page.click(`[data-tab="${tabId}"]`);
  await page.waitForTimeout(150);
}

async function clickTreeItem(page, treeSelector, filter) {
  const item = page.locator(`${treeSelector} .tree-item`).filter(filter).first();
  await expect(item).toBeVisible({ timeout: 5000 });
  await item.click();
  await page.waitForTimeout(100);
}

test.describe('Toolbar actions and tooltips (v3)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`file://${INDEX}`);
    await page.waitForSelector('#config-tree .tree-item', { timeout: 10000 });
  });

  test('Actions tab — CRUD disabled with no tooltip', async ({ page }) => {
    await switchAppTab(page, 'actions');
    await expect(page.locator('#btn-add')).toBeDisabled();
    await expect.poll(() => getDisabledTip(page, 'btn-add')).resolvesTo(null);
    await expect.poll(() => getDisabledTip(page, 'btn-remove')).resolvesTo(null);
  });

  test('System settings — Filter disabled with no tooltip', async ({ page }) => {
    await switchAppTab(page, 'system-settings');
    await expect(page.locator('#toolbar-filter-trigger')).toBeDisabled();
    await expect.poll(() => getDisabledTip(page, 'toolbar-filter-trigger')).resolvesTo(null);
  });

  test('Work areas — configuration group Remove shows same tip as root', async ({ page }) => {
    await switchAppTab(page, 'work-areas');
    await clickTreeItem(page, '#config-tree', { hasText: 'Default' });
    await expect(page.locator('#btn-remove')).toBeDisabled();
    const groupTip = await getDisabledTip(page, 'btn-remove');
    await clickTreeItem(page, '#config-tree', { hasText: 'All configuration groups' });
    const rootTip = await getDisabledTip(page, 'btn-remove');
    expect(groupTip).toMatch(/Select a work area or perspective to remove/);
    expect(rootTip).toBe(groupTip);
  });

  test('Tabs setup — Default configuration group enables Add', async ({ page }) => {
    await switchAppTab(page, 'tabs-setup');
    await clickTreeItem(page, '#tabs-config-tree', { hasText: 'Default' });
    await expect(page.locator('#btn-add')).toBeEnabled();
    await expect.poll(() => getDisabledTip(page, 'btn-add')).resolvesTo(null);
  });

  test('Tabs setup — root Add disabled with group tip', async ({ page }) => {
    await switchAppTab(page, 'tabs-setup');
    await clickTreeItem(page, '#tabs-config-tree', { hasText: 'All configuration groups' });
    await expect(page.locator('#btn-add')).toBeDisabled();
    const tip = await getDisabledTip(page, 'btn-add');
    expect(tip).toMatch(/Select a configuration group in the tree to add a tab/);
  });

  test('Tabs setup — configuration group enables Duplicate (content to)', async ({ page }) => {
    await switchAppTab(page, 'tabs-setup');
    await clickTreeItem(page, '#tabs-config-tree', { hasText: 'Default' });
    await expect(page.locator('#btn-duplicate')).toBeEnabled();
  });

  test('Work areas — Default configuration group enables Add', async ({ page }) => {
    await switchAppTab(page, 'work-areas');
    await clickTreeItem(page, '#config-tree', { hasText: 'Default' });
    await expect(page.locator('#btn-add')).toBeEnabled();
    await expect.poll(() => getDisabledTip(page, 'btn-add')).resolvesTo(null);
  });

  test('Tab switch — System settings Default then Tabs keeps Add enabled', async ({ page }) => {
    await switchAppTab(page, 'system-settings');
    await clickTreeItem(page, '#system-settings-tree', { hasText: 'Default' });
    await switchAppTab(page, 'tabs-setup');
    await clickTreeItem(page, '#tabs-config-tree', { hasText: 'Default' });
    await expect(page.locator('#btn-add')).toBeEnabled();
    await expect.poll(() => getDisabledTip(page, 'btn-add')).resolvesTo(null);
  });

  test('Save — no unsaved changes', async ({ page }) => {
    await expect.poll(() => getDisabledTip(page, 'btn-save')).resolvesTo('No unsaved changes to save.');
    await expect(page.locator('#btn-save')).toBeDisabled();
  });

  test('Specific views — category Remove disabled with no tooltip', async ({ page }) => {
    await switchAppTab(page, 'specific-views');
    const category = page.locator('#specific-views-tree .tree-item[data-type="sv-category"]').first();
    await expect(category).toBeVisible({ timeout: 5000 });
    await category.click();
    await page.waitForTimeout(100);
    await expect(page.locator('#btn-remove')).toBeDisabled();
    await expect.poll(() => getDisabledTip(page, 'btn-remove')).resolvesTo(null);
    await expect.poll(() => getDisabledTip(page, 'btn-duplicate')).resolvesTo(null);
  });

  test('Specific views — configuration Remove enabled', async ({ page }) => {
    await switchAppTab(page, 'specific-views');
    const config = page
      .locator('#specific-views-tree .tree-item[data-type="sv-config"]')
      .filter({ hasText: 'Table for shoes and shirts' })
      .first();
    await expect(config).toBeVisible({ timeout: 5000 });
    await config.click();
    await page.waitForTimeout(100);
    await expect(page.locator('#btn-remove')).toBeEnabled();
  });

  test('Tabs setup — root Duplicate disabled with content-to hint', async ({ page }) => {
    await switchAppTab(page, 'tabs-setup');
    await clickTreeItem(page, '#tabs-config-tree', { hasText: 'All configuration groups' });
    await expect(page.locator('#btn-duplicate')).toBeDisabled();
    const tip = await getDisabledTip(page, 'btn-duplicate');
    expect(tip).toMatch(/duplicate its content, or a tab to duplicate/);
  });
});
