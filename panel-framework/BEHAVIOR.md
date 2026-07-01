# Panel Framework — behavior guide (Phase 1)

Reference for UX and engineering. Describes **intended Phase 1** behavior aligned with the prototype in `index.html` (v2).  
Assumes **1rem = 16px**.

### Scope

| Phase 1 (this doc) | Phase 2 (not in scope yet) |
|--------------------|----------------------------|
| Side **rails** visible; panels expand/collapse inline | **Hamburger mode** — rails hidden, panels as overlays |
| Viewport **≥ 896px** (Details) / **≥ 1024px** (Bulk) | Layout below those widths |
| Panel eviction, resize, tab layouts | Mobile / overlay navigation patterns |

The prototype still contains hamburger code for experimentation; **do not design or test against it** for Phase 1 deliverables.

---

## What this layout is for

A product shell with **optional side panels** around a **main workspace**. The workspace holds the primary task (form, table, etc.). Panels are for navigation, context, and tools — not replacements for the main content.

Two top-level **modes**:

| Mode | Purpose | Panels available |
|------|---------|------------------|
| **Details** | Single record (edit / inspect) | Browse, Task list, Panel, Assistant |
| **Bulk** | Many records (list) | Browse, Assistant only |

Within **Details**, **tabs** change only what appears **inside the workspace** — not which shell panels exist.

---

## Shell vs workspace (important)

**Shell panels** (always in Details mode):

| Panel | Role |
|-------|------|
| **Browse** | Outer-left — high-level navigation |
| **Task list** | Inner-left — items in current scope |
| **Assistant** | Outer-right — AI / activity (toolbar button; hidden when closed) |

**Workspace** (main column + optional **Panel**):

| Tab | Workspace content | Panel |
|-----|-------------------|--------|
| Form + panel | Form fields | **Panel** on the **right** (metadata) |
| Form only | Form fields | Hidden |
| Table | Table | Hidden |
| Panel + Table | Table | **Panel** on the **left** (hierarchy) |

The workspace **Panel** is the same component in both positions; only placement and content variant change.

**Rule:** Switching Details tabs must **not** open, close, or reorder shell panels (Browse, Task list, Assistant). Tabs only swap workspace layout and show/hide/reposition the workspace Panel.

---

## Size rules

| Token | rem | px | Used for |
|-------|-----|-----|----------|
| Panel min (expanded) | 20rem | 320px | Minimum width when a panel is open |
| Panel max (expanded) | 56rem | 896px | Hard cap per panel when resizing |
| Collapsed rail | 4rem | 64px | Width of a collapsed panel rail (except Assistant) |
| Assistant closed | — | 0px | No rail when Assistant is closed |
| Details content floor | 21rem | 336px | Minimum workspace width |
| Bulk content floor | 40rem | 640px | Minimum workspace width in Bulk |

**Tables** (Details Table tab and Bulk list) use `table-layout: fixed` and wrapping cells so they **fit the workspace** instead of forcing horizontal page scroll.

---

## Breakpoints (viewport width)

Breakpoints control **how many panels may be expanded at once**. Phase 1 assumes **rails stay visible** down to the lowest tier below.

### Details mode (Phase 1: ≥ 896px / 56rem)

| Tier | Viewport | rem (÷16) | Max expanded panels |
|------|----------|-----------|---------------------|
| bp4 | ≥ 2304px | ≥ 144rem | 4 |
| bp3 | ≥ 1664px | ≥ 104rem | 3 |
| bp2 | ≥ 1088px | ≥ 68rem | 2 |
| bp1 | ≥ 896px | ≥ 56rem | 1 |

Below 896px is **Phase 2** — not specified here.

### Bulk mode (Phase 1: ≥ 1024px / 64rem)

| Tier | Viewport | rem (÷16) | Max expanded panels |
|------|----------|-----------|---------------------|
| bp2 | ≥ 1280px | ≥ 80rem | 2 |
| bp1 | ≥ 1024px | ≥ 64rem | 1 |

Below 1024px is **Phase 2** — not specified here.

### Physical fit (why panel count can drop further)

Tier caps assume panels at **minimum width** plus the **content floor**. If `panels + content floor` still exceeds the viewport, the system closes more panels until things fit — so panels are not clipped.

**Why thresholds are rounded above the pure math:** tiers are tuned for comfortable rails and resize room, not the absolute tightest fit.

---

## When space is tight: eviction order

If the viewport shrinks or a new panel opens and there is not enough room, panels close automatically (**system close**). Order is **fixed**, not based on “last opened” (which felt random in testing).

1. **Priority** — lower number closes first:  
   - Priority 1: Browse, Panel  
   - Priority 2: Task list, Assistant  

2. **Tie-break** (same priority):  
   **Browse → Panel → Task list → Assistant**

**Opening a panel** when the cap is reached: prefer evicting from the **opposite side** first, then apply the order above.

**User-closed** panels are never auto-reopened. **System-closed** panels may restore when the viewport widens (last closed restores first).

---

## Tab switching — behavior and rationale

### Intended behavior

| Action | Shell panels | Workspace Panel |
|--------|--------------|-----------------|
| Tab change | **Unchanged** (open/closed state preserved) | Shown, hidden, or moved left/right per tab |
| Viewport resize | May auto-close/restore per breakpoints | Same rules; visibility still tab-driven |

**Defaults when entering a tab that uses the Panel** (Form + panel, Panel + Table): open Panel if the user did not close it and there is room. Mirrors the paired tab (e.g. Table tab ≈ Form only; Panel + Table ≈ Form + panel).

### Problems we hit in the prototype (and fixes)

**1. Unexpected panel jumps when switching tabs**  
Early versions re-ran breakpoint logic on every tab change and sometimes **closed panels** (including shell panels) when the content floor changed (e.g. a 64rem table floor). That felt like tabs were “resetting” the layout.

**Fix:** Tab switch only updates workspace CSS (content view, Panel position). **Breakpoint eviction runs on viewport resize**, not on tab change. Shell panel `open` state is global across Details tabs.

**2. Workspace Panel disappearing vs “closed”**  
On Form only / Table tabs the Panel is **hidden**, not user-closed. Its open state is **remembered** so returning to Form + panel or Panel + Table shows it again — unless the user explicitly closed it.

**3. Different table floor per tab broke panel counts**  
A larger table-only floor made the layout math reserve ~1024px for content, forcing **zero** panels at widths where panels should still be usable.

**Fix:** All Details tabs share the **21rem layout floor** for panel budgeting. Tables flex and wrap inside the workspace.

---

## Panel + Table specifics

- Workspace **Panel** sits **left** of the table (same component as Form + panel, different data: hierarchy).
- Collapsed rail layout and chevrons follow **left panel** rules (not right-panel DOM defaults).
- Header label: **“Panel”**.

---

## Bulk mode notes

- Task list and workspace Panel are **not available** (list context, not single-record).
- Entering Bulk **auto-expands Browse**.
- Same fluid table behavior as Details Table tab.

---

## Defaults (Details, first load)

- **Open:** Task list, Panel  
- **Collapsed:** Browse, Assistant  

---

## For implementers

- **Single source of truth:** panel open state is per panel id; tab only affects **visibility** of workspace Panel (`rightA` in code).
- **Do not** tie shell panel lifecycle to tab ids.
- **Do** run breakpoint / eviction on `resize` and when opening a panel — not on tab `change` alone.
- **Rem:** keep layout constants in rem; convert with root font size (prototype uses 16px).
- Live prototype exposes `window.PanelFramework` (`setMode`, `setTab`, `open`/`close`, events: `mode-change`, `tab-change`, `breakpoint-change`).

---

## Phase 2 — hamburger mode (out of scope)

Deferred. Will cover viewports below 896px (Details) and 1024px (Bulk): hidden rails, overlay panels, full-width content. **Not part of Phase 1 UX or acceptance criteria.**

---

## Quick test checklist (Phase 1)

- [ ] Details: switch all four tabs — Browse / Task list / Assistant stay as you left them  
- [ ] Form + panel ↔ Panel + Table — Panel stays open, moves left/right  
- [ ] Form only ↔ Table — Panel hidden but returns when going back to a panel tab (if not user-closed)  
- [ ] Resize between 896px and 2304px — eviction order: Browse → Panel → Task list → Assistant  
- [ ] At bp1 (~896px Details): at most one expanded panel; workspace keeps 21rem floor  
- [ ] Bulk at 1024px+ — table wraps; Browse can stay open per tier rules  
