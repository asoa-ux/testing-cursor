---
version: 1.0
name: conf-tool-v3-design
description: "Microsoft Fluent–inspired enterprise configuration tool: teal chrome header, Fluent blue accent, Segoe UI at 14px base, 2px corner radius on controls, dense toolbar + tree + form layout. Preserve existing CSS variables and BEM class names in index.html."

colors:
  header-bg: "#004d56"
  accent: "#0078d4"
  selection-bg: "#e1f5fe"
  text: "#323130"
  text-secondary: "#605e5c"
  border: "#e0e0e0"
  required: "#a4262c"
  toolbar-icon: "#605e5c"
  white: "#ffffff"
  filter-user: "#5c2d91"
  filter-active-bg: "#f0e6f3"
  filter-active-border: "#e8d4ef"
  hover-surface: "#f3f3f3"
  tooltip-bg: "#323130"

typography:
  base:
    fontFamily: '"Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.4
  header-title:
    fontSize: 15px
    fontWeight: 600
  header-lang:
    fontSize: 13px
    fontWeight: 400
  toolbar-label:
    fontSize: 11px
    fontWeight: 400
  popover-item:
    fontSize: 13px
    fontWeight: 400
  popover-header:
    fontSize: 12px
    fontWeight: 600

rounded:
  control: 2px
  tooltip: 4px
  badge: 8px

spacing:
  header-height: 48px
  icon-btn: 36px
  toolbar-item-min-width: 64px
---

# conf-tool-v3 design system

Agents building or changing UI in this project **must** match the live app in `index.html`. Do not swap in another brand (Linear, IBM, etc.) unless the user explicitly asks.

## Visual theme

Dense, task-focused **enterprise configuration** UI. Light canvas, teal app chrome, Fluent blue for primary actions and selection. Icons use **Phosphor** (`@phosphor-icons/web`). Whitespace is tight; hierarchy comes from weight, size, and surface bands—not marketing-style hero layouts.

## Color roles

| Token | Hex | Role |
|-------|-----|------|
| `header-bg` | #004d56 | App header background |
| `accent` | #0078d4 | Primary actions, badges, links, focus emphasis |
| `selection-bg` | #e1f5fe | Selected rows / highlights |
| `text` | #323130 | Primary body and labels |
| `text-secondary` | #605e5c | Meta, toolbar labels, icons |
| `border` | #e0e0e0 | Dividers, popovers, inputs |
| `required` | #a4262c | Required field indicator |
| `filter-user` | #5c2d91 | User-filter accent |
| `filter-active-bg` / `filter-active-border` | #f0e6f3 / #e8d4ef | Active filter chip |
| `hover-surface` | #f3f3f3 | Toolbar items, popover rows |
| `tooltip-bg` | #323130 | Disabled toolbar tips |

Implement via existing `:root` CSS variables (`--header-bg`, `--accent`, etc.)—do not introduce parallel naming unless refactoring the whole file.

## Typography

- **Family**: Segoe UI stack (see `html, body` in `index.html`).
- **Base**: 14px / 400 on `html, body`.
- **Header title**: 15px / 600 (`.app-header__title`).
- **Toolbar labels**: 11px under icons (`.toolbar__item span`).
- **Popovers**: 13px items, 12px / 600 headers.

## Components

### App header (`.app-header`)

- Height **48px**, background `var(--header-bg)`, white text.
- Brand logo max-height **1.5rem**; icon buttons **36×36px**, `border-radius: 2px`, hover `rgba(255,255,255,0.12)`.

### Toolbar (`.toolbar`, `.toolbar__item`)

- White bar, bottom border `var(--border)`.
- Items: column layout, min-width **64px**, icon 20px + 11px label.
- Disabled tips: `data-disabled-tip` on `.toolbar__item-wrap`, 12px white-on-charcoal tooltip, **4px** radius, **500ms** delay (`--toolbar-disabled-tip-delay`). See `TOOLTIP-BLUEPRINT.md` for copy rules.

### Popovers (`.popover`)

- `position: fixed`, min-width **200px**, 1px border + light shadow.
- Items: 8px 12px padding, hover `#f3f3f3`.

### Forms & trees

- Match existing patterns in `index.html` (inputs, tabs, sidebar). Keep **2px** control radius unless a component already uses 4px (e.g. filter chips).

## Layout

- Full-height app: `html, body { height: 100% }`, `overflow-x: clip`.
- Toolbar + main split; sidebar uses `var(--sidebar-bg)` / `var(--tab-bar-bg)`.
- Prefer **4px / 8px / 12px** spacing increments already used in padding rules.

## Depth

- Cards and panels: **1px borders** and light shadows (`0 4px 16px rgba(0,0,0,0.14)` on popovers)—not heavy Material elevation.
- Selection: `var(--selection-bg)` fill, not thick outlines.

## Do's

- Reuse BEM blocks already in the file (`app-header`, `toolbar`, `popover`, `icon-btn`, etc.).
- Keep toolbar enablement aligned with `ACTION-STATE-STRATEGY.md` and tip strings in `TOOLTIP-BLUEPRINT.md`.
- Use Phosphor icon classes consistent with existing `.icon--12|16|20` sizes.

## Don'ts

- Don't replace the teal header or Fluent palette with another design-md brand.
- Don't round buttons to pills or switch to a display/marketing type scale.
- Don't add tooltips where `TOOLTIP-BLUEPRINT.md` marks **no-tooltip**.
- Don't change disabled-tip delay without updating tests in `tests/tooltip.spec.mjs`.

## Related docs

| File | Purpose |
|------|---------|
| `DOCS.md` | Doc index |
| `TOOLTIP-BLUEPRINT.md` | Toolbar tip contracts |
| `ACTION-STATE-STRATEGY.md` | Enablement rules |

## Agent prompts

- "Add a toolbar action for X using conf-tool-v3 DESIGN.md and TOOLTIP-BLUEPRINT.md."
- "Style this panel like existing popovers in index.html; follow DESIGN.md colors and 2px radius."
