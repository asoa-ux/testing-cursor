# Toolbar disabled-tooltip blueprint (conf-tool-v3)

Authoritative catalog of `data-disabled-tip` strings and **no-tooltip** (`null`) rules for `conf-tool-v3/index.html`.

**Companion docs:** `ACTION-STATE-STRATEGY.md` (how to audit), `ISSUES-REGISTER.md` (known gaps), `tests/tooltip.spec.mjs` (executable contracts).

## v3 vs v2

| Topic | v2 | v3 |
|-------|----|----|
| Tree selection | Multi-select bulk on WA/Tabs | **Single-select** only |
| Configuration groups on WA/Tabs | Remove/Move sometimes enabled with “managed in SS” tip | Remove/Move **disabled** on group/root; contextual tip (select tab/WA) |
| Group duplicate | “Cannot be duplicated” disabled tip | **Enabled** → Duplicate menu → **Duplicate content to** |
| Actions tab | “Not available on this tab.” tips | **No tooltip** (`null`) |
| Specific views Move | Tip: “Move is not available on Specific views.” | **No tooltip** (`null`) |
| Specific views category | Tip: “Select a configuration to …” | **No tooltip** on Remove/Duplicate (`null`) |

---

## Mechanism

| Aspect | Behavior |
|--------|----------|
| **UI** | `.toolbar__item-wrap[data-disabled-tip]::after` shows tip on hover/focus-within |
| **Delay** | `--toolbar-disabled-tip-delay: 500ms` |
| **API** | `syncToolbarButtonTip(btnId, enabled, disabledTip)` |
| **No tip** | `enabled === true` **or** `disabledTip == null` → attribute removed |
| **Reset** | `clearAllToolbarDisabledTips()` at start of each `updateToolbarButtons()` |
| **Fallback** | Empty string when disabled → *"This action is not available for the current selection."* |

### Toolbar controls

| Button ID | Tips from |
|-----------|-----------|
| `toolbar-filter-trigger` | `updateToolbarFilterButton()` |
| `btn-add`, `btn-remove`, `btn-duplicate`, `btn-move` | Per-editor `updateToolbarButtons()` |
| `btn-save` | `updateSaveButton()` only |

---

## Tip kinds

| Kind | When | Example |
|------|------|---------|
| **None** | Button enabled | — |
| **Permanent null** | Never actionable in this context | Actions CRUD; Filter on System settings |
| **Contextual string** | User can change selection/filters to enable | Root selected → “Select a configuration group…” |
| **Hidden by filters** | `getHiddenByFiltersTip()` | Selected node not visible under active filter |

---

## Layer 0 — Global

### Actions tab (`getEditorContext()` → `null`)

`disableToolbarForNonEditorTab()` — all CRUD disabled, **`null` tips** (no hover text).

### Filter (`updateToolbarFilterButton`)

| Condition | Enabled? | Tooltip |
|-----------|----------|---------|
| Work areas or Tabs **and** filter layout **option 3** | Yes | — |
| System settings, Specific views, Actions | No | **`null`** (no tip) |
| WA/Tabs but layout ≠ option 3 | No | Set Filter UI to option 3 to use the toolbar filter control. |

When disabled on non-editor tabs, tip is **`null`**, not “only WA/Tabs”.

### Save (`updateSaveButton`)

| Condition | Tooltip |
|-----------|---------|
| `hasUnsavedChanges` | — |
| Otherwise | No unsaved changes to save. |

Save tips are **not** refreshed on app-tab switch.

---

## Layer 1 — System settings

Functions: `SystemSettingsEditor.get*DisabledTip`, `canRemove`, `canDuplicate` (always false).

### Add

| Selection | Enabled? | Tooltip when disabled |
|-----------|----------|------------------------|
| Config groups folder / configuration group | Yes | — |
| Main settings, Quick links, other | No | Select Configuration groups or a configuration group in the sidebar to add a configuration group. |

### Remove

| Selection | Enabled? | Tooltip when disabled |
|-----------|----------|------------------------|
| Configuration group (not Default) | Yes | — |
| Default group | No | **`null`** |
| Main settings / Quick links | No | Select a configuration group in the sidebar to remove it (Default cannot be removed). |
| Config groups folder only | No | Select a configuration group to remove (Default cannot be removed). |

### Duplicate / Move

| Control | Always | Tooltip |
|---------|--------|---------|
| Duplicate | Disabled | **`null`** |
| Move | Disabled | **`null`** |
| Filter | Disabled | **`null`** |

---

## Layer 2 — Work areas (single-select)

Tree: `#config-tree`. Types: `root`, `group`, `work-area`, `perspective`.

### Shared strings

| Helper | Text |
|--------|------|
| `getHiddenByFiltersTip()` | The selected item is hidden by the current search or filters. |
| `tipGroupsManagedInSystemSettings(verb)` | *(defined but unused in v3 — groups use `null` instead)* |

### Add (`getWaAddDisabledTip`)

| Selection | Enabled? | Tooltip when disabled |
|-----------|----------|------------------------|
| Configuration group (`findGroup`) | Yes (add work area) | — |
| Work area (visible) | Yes (add perspective) | — |
| Perspective (parent WA visible) | Yes | — |
| Root | No | Select a configuration group in the tree to add a work area. |
| Perspective (parent hidden) | No | Hidden-by-filters |
| Group/WA/perspective hidden | No | Hidden-by-filters |
| Fallback | No | Select a configuration group, work area, or perspective to add items. |

**Note:** Add on **group** stays enabled when children are filtered out (group exists in store).

### Remove / Move (`getWaItemActionDisabledTip`)

| Order | Condition | Tip |
|-------|-----------|-----|
| 1 | `can*` true | — |
| 2 | Group + remove/move | Select a work area or perspective to {verb}. (same as root) |
| 3 | Group + duplicate (disabled, not hidden) | **`null`** |
| 4 | Root | Select a work area or perspective to {verb}. |
| 5 | Hidden by filters | Hidden-by-filters |
| 6 | WA/perspective still disabled | Hidden-by-filters |
| 7 | Fallback | Select a work area or perspective to {verb}. |

### Duplicate (`getWaDuplicateDisabledTip`)

| Selection | Enabled? | Menu | Tooltip when disabled |
|-----------|----------|------|------------------------|
| Configuration group (visible) | Yes | Duplicate **content to** (+ no “here” for group) | — |
| Work area / perspective (visible) | Yes | Duplicate here / Duplicate to | — |
| Root | No | — | Select a configuration group to duplicate its content, or a work area or perspective to duplicate. |
| Group hidden by filters | No | — | Hidden-by-filters |

---

## Layer 3 — Tabs setup (single-select)

Tree: `#tabs-config-tree`. Types: `root`, `group`, `tab`. Mirror Work areas rules.

### Add (`getTabsAddDisabledTip`)

| Selection | Enabled? | Tooltip when disabled |
|-----------|----------|------------------------|
| Group (`findGroup`) | Yes | — |
| Tab (visible) | Yes | — |
| Root | No | Select a configuration group in the tree to add a tab. |
| Tab hidden | No | Hidden-by-filters |
| Group hidden | No | Hidden-by-filters |
| Fallback | No | Select a configuration group or tab in the tree to add a tab. |

### Remove / Move (`getTabsItemActionDisabledTip`)

Same pattern as WA: group and root remove/move → “Select a tab to {verb}.”; hidden → hidden tip.

### Duplicate (`getTabsDuplicateDisabledTip` + group branch)

| Selection | Enabled? | Tooltip when disabled |
|-----------|----------|------------------------|
| Group (visible) | Yes (content to) | — |
| Tab (visible) | Yes | — |
| Root | No | Select a configuration group to duplicate its content, or a tab to duplicate. |
| Group, duplicate disabled (edge) | No | Select a configuration group, then use Duplicate content to. *(only when `canDuplicate` false while type is group — e.g. should not show if hidden; prefer hidden tip via filters)* |

**Regression:** Default group selected → Add **enabled**, no “select a configuration group or tab” tip.

**Cross-tab:** `ensureTabsTreeSelection()` on enter — stale `configuration-group` from System settings must not break Add.

---

## Layer 4 — Specific views

Tree: `#specific-views-tree`. Types: `sv-empty`, `sv-category`, `sv-config`.

| Control | Enabled when | Tooltip when disabled |
|---------|--------------|------------------------|
| Add | `getAddOptions().length > 0` | Select a category or configuration to add a view. |
| Remove | `sv-config` | **`null`** on category/empty; else Select a configuration to remove. |
| Duplicate | `sv-config` | **`null`** on category/empty; else Select a configuration to duplicate. |
| Move | Never | **`null`** |

Resolver: `getSvItemActionDisabledTip(actionVerb, isEnabled)`.

---

## Duplicate menu (WA / Tabs) — not toolbar tips

When Duplicate is enabled with chevron:

| Item | When shown |
|------|------------|
| Duplicate here | WA/perspective or tab (not group) |
| Duplicate to | WA/perspective or tab |
| **Duplicate content to** | Configuration group selected |

Popover headers use “Select configuration group” / “Duplicate content to” (separate from `data-disabled-tip`).

### Single configuration group

When `hasSingleConfigurationGroup()` (`isCrossGroupRelocationAvailable()` is false):

| Action | WA / Tabs |
|--------|-----------|
| **Move** | WA: disabled on **work area** (no other group); tooltip **`null`**. **Perspective**: enabled when another work area exists in the group (move between work areas). Tabs: disabled on tab; tooltip **`null`** |
| **Duplicate to** | Hidden in menu; `canDuplicateTo()` false |
| **Duplicate content to** | Hidden; `canCopyGroupContent()` false |
| **Duplicate here** | Still available for WA/perspective or tab |

Duplicate toolbar may show **without** chevron (only “duplicate here” path).

---

## QA checklist

### Cross-cutting

- [ ] Actions tab — CRUD disabled, **no** `data-disabled-tip`
- [ ] Enabled buttons — no `data-disabled-tip`
- [ ] Filter — SS/SV/Actions: disabled, no tip; WA/Tabs wrong layout: layout tip
- [ ] Save — exact string when disabled

### Work areas / Tabs

- [ ] Root / group / leaf single-select
- [ ] Default group → Add enabled
- [ ] Group → Remove/Move disabled, **no tip**
- [ ] Group → Duplicate enabled → content to
- [ ] Filter hides selected tab/WA → hidden tip on Remove/Duplicate/Move
- [ ] Group selected, children filtered out → Add still enabled
- [ ] SS → Tabs with Default selection → Add enabled

### System settings / Specific views

- [ ] Default remove → no tip
- [ ] SV category → Remove/Duplicate disabled, no tip
- [ ] SV config → Remove/Duplicate enabled

---

## Code map

| Concern | Location (approx.) |
|---------|-------------------|
| Core API | `syncToolbarButtonTip`, `clearAllToolbarDisabledTips` |
| Orchestrator | `updateToolbarButtons()` |
| Work areas | `getWaAddDisabledTip`, `getWaItemActionDisabledTip`, `getWaDuplicateDisabledTip` |
| Tabs | `TabsEditor` — `getTabs*`, `ensureTabsTreeSelection`, `isTabsAddEnabled` |
| System settings | `SystemSettingsEditor.get*DisabledTip` |
| Specific views | `getSvItemActionDisabledTip`, `getAddDisabledTip` |
| Filter | `getToolbarFilterDisabledTip`, `updateToolbarFilterButton` |
| Save | `updateSaveButton` |

*Last aligned with `conf-tool-v3/index.html` toolbar logic.*
