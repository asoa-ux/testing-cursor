# Toolbar action state — strategy (conf-tool-v3)

How to know which toolbar actions are enabled or disabled, keep tooltips accurate, and test coverage complete.

## 1. Sources of truth (read the code in this order)

| Layer | What controls state | Entry points |
|-------|---------------------|--------------|
| **App tab** | `getEditorContext()` → `work-areas`, `tabs-setup`, `system-settings`, `specific-views`, or `null` (Actions) | `onEditorPanelChange()`, tab buttons `[data-tab]` |
| **Selection** | Shared `selected` object (shape differs per editor) | Tree click handlers, `ensureWaTreeSelection()`, `ensureTabsTreeSelection()` |
| **Filters** | `isFilterActive()`, `is*SelectionVisible()` | Filter panel, smart filter, search |
| **Enablement** | `can*` / `is*Enabled()` per editor | Called from `updateToolbarButtons()` |
| **Tooltips** | `get*DisabledTip()` → `syncToolbarButtonTip(btnId, enabled, tip)` | Only when button is **disabled** |

**Rules:**

1. Every disabled toolbar button gets its tip from the matching `get*DisabledTip()` in the same `updateToolbarButtons()` pass. No tip on **enabled** buttons.
2. **Permanent disable** (action can never be enabled in this app tab or for this selection type): pass `null` to `syncToolbarButtonTip` → no `data-disabled-tip`, no hover tooltip. Examples: Filter on System settings; Remove/Move on a configuration group in Work areas/Tabs; Duplicate/Move on System settings; CRUD on Actions tab.
3. **Contextual disable** (user could change selection or filters to enable): pass a string tip. Examples: root selected → “Select a configuration group…”; tab hidden by filters → hidden-by-filters tip.

### v3 selection shapes

| App tab | Valid `selected.type` | Notes |
|---------|----------------------|--------|
| Work areas | `root`, `group`, `work-area`, `perspective` | Single-select tree |
| Tabs setup | `root`, `group`, `tab` | Single-select tree |
| System settings | `main-settings`, `config-groups-folder`, `configuration-group`, `quick-links`, … | Own tree |
| Specific views | `root`, `view`, … | Own model |
| Actions | N/A | `disableToolbarForNonEditorTab()` |

**Cross-tab bug class:** Leaving System settings with `selected.type === 'configuration-group'` and opening Tabs/Work areas without normalizing selection → empty `getAddOptions()`, generic disabled tips. Fixed for Tabs via `ensureTabsTreeSelection()` on tab enter (mirror `ensureWaTreeSelection()` on Work areas).

### Add enablement (Tabs v3 fix)

| Selection | Add enabled when |
|-----------|------------------|
| Root | Never |
| Configuration group | Group exists in tree (`findGroup`) — **not** “has visible tabs under filters” |
| Tab | Tab visible under current filters (`isTabAddContextVisible`) |

Same idea on Work areas: **group** → add work area if group exists; **perspective** → add only if parent context visible under filters.

---

## 2. Action matrix (audit checklist)

Use this grid when adding a feature or debugging a wrong tooltip. Fill **E** = enabled, **D** = disabled, note **tip id** from `TOOLTIP-BLUEPRINT.md` / `get*DisabledTip`.

### Tabs setup (single-select)

| Selection | Add | Remove | Duplicate | Move | Filter |
|-----------|-----|--------|-----------|------|--------|
| Root | D → select group | D → select tab | D → select group/tab | D → select tab | layout |
| Group (e.g. Default) | **E** | D → managed SS | E → Duplicate content to | D → managed SS | layout |
| Tab (visible) | E | E | E | E | layout |
| Tab (hidden by filter) | D → hidden | D → hidden | D → hidden | D → hidden | layout |
| Stale / wrong type | D → generic | D → generic | D → generic | D → generic | layout |

### Work areas (single-select)

| Selection | Add | Remove | Duplicate | Move |
|-----------|-----|--------|-----------|------|
| Root | D | D | D | D |
| Group | E (WA) | D → managed SS | E → Duplicate content to | D → managed SS |
| Work area | E (perspective) | E | E | E |
| Perspective | E* | E | E | E |

\*Perspective add only if parent work area visible under filters.

### System settings / Specific views / Actions

See `TOOLTIP-BLUEPRINT.md` layers 1 and 4.

---

## 3. How to audit after a change

1. **Grep enablement** — `canAdd`, `canRemove`, `canDuplicate`, `canMove`, `isAddEnabled`, `isTabsAddEnabled`, `updateToolbarButtons`.
2. **Grep tips** — `getWaAddDisabledTip`, `getTabsAddDisabledTip`, `getTabsItemActionDisabledTip`, `syncToolbarButtonTip`.
3. **Trace one path** — selection → `can*` → `updateToolbarButtons` → `syncToolbarButtonTip`.
4. **Tab switch** — select node on tab A, switch to tab B, confirm `ensure*TreeSelection()` and tips.
5. **Filters** — with group selected, apply search that hides all children: Add on group should stay enabled (Tabs/WA); Remove on hidden tab should stay disabled with hidden tip.
6. **Compare blueprint** — update `TOOLTIP-BLUEPRINT.md` if copy or rules change.

---

## 4. Testing strategy

### Level A — Manual smoke (5 min)

Per app tab: click each tree level once, hover disabled toolbar buttons, confirm tip text matches blueprint.

**Tabs regression:** Select **Default** → Add enabled, no “select a configuration group or tab” tip.

### Level B — Automated tooltips (Playwright)

- Location: `conf-tool-v3/tests/tooltip.spec.mjs`
- Run: `npx playwright test` from `conf-tool-v3` (see `playwright.config.mjs`)
- Reads `data-disabled-tip` on `.toolbar__item-wrap` ancestor of each `#btn-*`
- One test per **tip contract** (not every matrix cell); add a test when a bug regresses

**Priority tests to add when extending matrix:**

| Scenario | Assert |
|----------|--------|
| Tabs → Default group | `#btn-add` enabled, `data-disabled-tip` absent |
| Tabs → root | Add disabled, tip mentions configuration group |
| WA → Default group | Add enabled |
| Tab switch SS → Tabs | After selecting Default in SS, switch to Tabs, Add enabled on Default |
| Filters hide selected tab | Remove disabled, hidden-by-filters tip |

### Level C — Optional matrix runner

For full combinatorial coverage later:

- Expose read-only debug API on `window` (e.g. `__confToolDebug = { context, selected, actions: { add: { enabled, tip } } }`) updated in `updateToolbarButtons()`.
- Playwright iterates scripted selection + filter states and snapshots action map.

---

## 5. When a tooltip is wrong — debug order

1. What is `selected`? (DevTools: break on `updateToolbarButtons` in Tabs/Work areas.)
2. Is `getEditorContext()` correct?
3. Does `getAddOptions()` / `can*` return what you expect?
4. Is selection normalized after tab switch?
5. Is the generic fallback firing because `selected.type` is invalid for this editor?
6. Update `get*DisabledTip()` **and** the matching `can*` — tips must not describe a state that is still enabled.

---

## 6. Tooltip audit notes (v3)

### Correct (no tooltip — permanent disable)

| Context | Controls |
|---------|----------|
| Actions tab | Add, Remove, Duplicate, Move |
| System settings | Filter, Move, Duplicate |
| System settings | Remove on **Default** group |
| Work areas / Tabs | Remove, Move on **configuration group** — use contextual “Select a tab/work area…” tip (same as root), not silent |
| Specific views | Move; Remove/Duplicate on **category** (not `sv-config`) |

### Correct (contextual tip)

| Scenario | Tip |
|----------|-----|
| Root selected | “Select a configuration group…” (add) / “Select a work area or tab…” (actions) |
| Hidden by filters | `getHiddenByFiltersTip()` |
| Filter on WA/Tabs, layout ≠ option 3 | Layout hint (user can change Filter UI setting) |
| Save, no changes | “No unsaved changes to save.” |

### Fixed in code (were wrong)

| Issue | Fix |
|-------|-----|
| Group selected but **hidden by filters**, Duplicate disabled showed “Select a configuration group, then use Duplicate content to.” | Hidden-by-filters tip (or no tip when permanently N/A). |
| Specific views **category** selected, Remove/Duplicate showed “Select a configuration…” | No tooltip (`null`) — only `sv-config` is removable/duplicable. |

### Low priority / acceptable

- **Save** tip not refreshed on app-tab switch (only on markUnsaved).
- **System settings** `getRemoveDisabledTip` branch for non-default `configuration-group` that cannot be removed is unreachable (only Default blocks remove).
- **Stale selection** after filters: `ensureTabsTreeSelection` / `ensureWaTreeSelection` on tab enter; hidden-by-filters tips if selection remains off-tree.

## 7. Related docs

| File | Role |
|------|------|
| `DOCS.md` | Index of all rule docs and npm scripts |
| `TOOLTIP-BLUEPRINT.md` | Full string catalog (v3: single-select, Duplicate content to, null tips) |
| `ISSUES-REGISTER.md` | Known gaps, fixed regressions, triage steps |
| `tests/tooltip.spec.mjs` | Executable tip contracts |
| `scripts/audit-toolbar-rules.mjs` | Static checks (`npm run audit:toolbar`) |
