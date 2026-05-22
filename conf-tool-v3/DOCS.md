# conf-tool-v3 documentation index

Use these together to keep toolbar rules consistent and catch regressions.

| Doc | Purpose |
|-----|---------|
| [TOOLTIP-BLUEPRINT.md](./TOOLTIP-BLUEPRINT.md) | Exact disabled-tip strings and **no-tooltip** rules per app tab/selection |
| [ACTION-STATE-STRATEGY.md](./ACTION-STATE-STRATEGY.md) | Enablement flow, audit checklist, testing levels, debug order |
| [ISSUES-REGISTER.md](./ISSUES-REGISTER.md) | Known gaps, fixed regressions, triage steps |
| [tests/tooltip.spec.mjs](./tests/tooltip.spec.mjs) | Executable tip contracts (Playwright) |

## Commands

```bash
cd conf-tool-v3
npm run audit:toolbar   # static rule checks (no browser)
npm run test:tooltips   # Playwright tooltip tests
```

## When you change toolbar behavior

1. Update matching `can*` / `get*DisabledTip` in `index.html`.
2. Update `TOOLTIP-BLUEPRINT.md` if copy or null-tip rules change.
3. Add or adjust a Playwright test if the rule should not regress.
4. Note open issues in `ISSUES-REGISTER.md`.
