# Issues register (conf-tool-v3)

Living list of **known gaps**, **fixed regressions**, and **how to spot new problems**. Update this when you change toolbar/selection logic.

## How to find new issues

| Step | Command / action |
|------|------------------|
| 1 | `npm run audit:toolbar` — static checks (missing tip helpers, blueprint drift) |
| 2 | `npm run test:tooltips` — Playwright tip contracts |
| 3 | Manual matrix in `ACTION-STATE-STRATEGY.md` §2 |
| 4 | Compare hover tips to `TOOLTIP-BLUEPRINT.md` |

After any toolbar change: run 1 + 2, then spot-check one row per app tab in the matrix.

---

## Open / watch

| ID | Severity | Area | Description | Mitigation |
|----|----------|------|-------------|------------|
| I-001 | Low | Save | Save tooltip not refreshed on app-tab switch | Acceptable; only updates on `markUnsaved` / `markSaved` |
| I-002 | Low | System settings | `getRemoveDisabledTip` branch for non-removable non-Default group is unreachable | Dead code; only Default blocks remove |
| I-003 | Medium | Filters + selection | Stale selection after aggressive filtering may leave odd tips until re-click | `ensureTabsTreeSelection` / `ensureWaTreeSelection` on tab enter; hidden tip if off-tree |
| I-004 | Low | Code hygiene | `tipGroupsManagedInSystemSettings()` defined but unused (v3 uses `null`) | Safe to remove in a cleanup pass |
| I-005 | Medium | Tests | Playwright matrix incomplete (filters, hidden tab) | Extend `tests/tooltip.spec.mjs` per blueprint checklist |

---

## Fixed (do not regress)

| ID | Was | Fix | Test |
|----|-----|-----|------|
| F-001 | Tabs Default group: Add disabled, wrong “select group or tab” tip | `isTabsAddEnabled` uses `findGroup`; `ensureTabsTreeSelection` on tab enter | `tooltip.spec.mjs` Default / tab switch |
| F-002 | Group hidden by filters: Duplicate showed “Select… Duplicate content to” | Hidden-by-filters tip on WA `getWaDuplicateDisabledTip` | Manual; add automated when filter UI scriptable |
| F-003 | Specific views category: Remove/Duplicate showed generic config tip | `getSvItemActionDisabledTip` returns `null` for category/empty | `tooltip.spec.mjs` SV category |
| F-004 | `getSvItemActionDisabledTip` referenced but **undefined** → runtime error on Specific views | Function added in `SpecificViewsEditor` | `npm run audit:toolbar` + SV category test |
| F-005 | Actions tab showed “Not available on this tab.” | `disableToolbarForNonEditorTab` uses `null` tips | `tooltip.spec.mjs` Actions tab |

---

## Adding an entry

```markdown
| I-00N | Low/Med/High | Area | One-line description | Workaround or next step |
```

Link PR/commit when fixed and move row to **Fixed** with test name.
