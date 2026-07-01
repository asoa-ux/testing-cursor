# Panel Framework — Phase 1 guide

*For UX and engineering. Prototype: `index.html`. 1rem = 16px.*

---

## Start here (30 seconds)

The screen has **shell panels on the sides** and a **content area in the middle**.  
Shell panels are for navigation and context. The content area is where the real work happens (form, table, etc.).

```
[ Browse ] [ Task list ]  │      CONTENT AREA       │  [ Assistant? ]
        shell panels      │  form / table + Panel?  │   shell panel
                          │  (changes with tab)    │
```

**The rule everyone should remember:**  
**Tabs only change the content area.** They never open, close, or shuffle Browse, Task list, or Assistant.

---

## Shell vs content area

| | What it is | What changes on tab switch |
|---|------------|----------------------------|
| **Shell panels** | Browse, Task list, Assistant | **Nothing** |
| **Content area** | Main column: header + form/table + optional Panel | **Layout and content** |

---

## Two views

| View | When | Shell panels |
|------|------|--------------|
| **Details** | One record | Browse, Task list, Assistant (+ Panel inside content area) |
| **Bulk** | Many records (list) | Browse, Assistant only |

---

## Details — four content area layouts (tabs)

These are **layout presets** for the content area. Shell stays the same.

| Tab | Content area shows | Panel |
|-----|-------------------|-------|
| Form + panel | Form | On the **right** (metadata) |
| Form only | Form | Off |
| Table | Table | Off |
| Panel + Table | Table | On the **left** (hierarchy) |

Same **Panel** component everywhere — only position and content change.

**Hiding ≠ closing.** On Form only / Table, the Panel is hidden but remembers if it was open. Come back to a tab that uses it and it reappears — unless the user closed it themselves.

---

## What happens when…

### …the user switches tabs?
- Content area swaps (form ↔ table, Panel on/off/left/right).
- **Browse, Task list, Assistant stay exactly as they were.**

### …the window gets narrower?
- Open panels **shrink** first (down to 20rem each).
- If still too tight, panels **close automatically** in a fixed order (see below).
- Panels the **user** closed stay closed.
- Panels the **system** closed may come back when the window widens again.

### …the user opens another panel?
- If the limit for that width is reached, something else closes first (same order as below).
- Prefer closing a panel on the **opposite side** when possible.

### …the user is on Bulk?
- Browse opens automatically.
- Task list and content-area Panel are not available.

---

## When space runs out — who closes first?

Fixed order (not “last opened” — that felt random in testing):

1. Browse  
2. Panel (in content area)  
3. Task list  
4. Assistant  

Task list and Assistant are kept longer than Browse and Panel.

---

## Default on first load (Details)

| Open | Collapsed |
|------|-----------|
| Task list, Panel | Browse, Assistant |

---

## Sizes & breakpoints (lookup)

### Fixed sizes

| What | rem | px |
|------|-----|-----|
| Panel min (open) | 20 | 320 |
| Panel max (open) | 56 | 896 |
| Collapsed rail | 4 | 64 |
| Assistant closed | — | 0 |
| Content area min (Details & Bulk) | 21 | 336 |

The **21rem floor applies to the whole middle column** (header + form/table + Panel when shown). The content-area Panel sits inside that column — layout math does not add its width on top of the floor.

Tables **do not wrap** — columns stay on one line. If the table is wider than the content area, it **scrolls horizontally** inside the table container (not the whole page).

### How many panels can be open?

**Details** (Phase 1: design for **896px and wider**)

| Window width | rem | Max open panels |
|--------------|-----|-----------------|
| ≥ 2304px | ≥ 144 | 4 |
| ≥ 1664px | ≥ 104 | 3 |
| ≥ 1088px | ≥ 68 | 2 |
| ≥ 896px | ≥ 56 | 1 |

**Bulk** (Phase 1: design for **896px and wider** — same floor as Details)

| Window width | rem | Max open panels |
|--------------|-----|-----------------|
| ≥ 1088px | ≥ 68 | 2 |
| ≥ 896px | ≥ 56 | 1 |

Below those widths → **Phase 2** (hamburger / overlays). Not part of Phase 1.

---

## Phase 2 (ignore for now)

Narrow screens: hidden rails, panels as overlays. The prototype has experimental code for this — **don’t design or test against it yet.**

---

## For developers (short)

- Panel `open` state is global; tabs only toggle **visibility** and position of the content-area Panel.
- Run layout eviction on **resize** and **open panel** — not on tab change.
- Constants in rem; prototype uses 16px root.
- API: `window.PanelFramework` — `setMode`, `setTab`, `open` / `close`, events `mode-change`, `tab-change`, `breakpoint-change`.

---

## Smoke test (5 minutes)

1. Switch all four Details tabs — shell panels don’t jump.  
2. Form + panel ↔ Panel + Table — Panel stays open, moves side.  
3. Form only ↔ Table — Panel hidden, then returns if not user-closed.  
4. Narrow the window — panels close in order: Browse → Panel → Task list → Assistant.  
5. Bulk at ~896px+ — table scrolls inside its container if needed; page does not scroll sideways.
