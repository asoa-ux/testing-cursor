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

**One size rule:** nothing important is narrower than **24rem (384px)** — the middle column and every open panel share that minimum.

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

**Collapse ≠ tab hide.** On a tab that uses the Panel, collapsing it leaves a **48px rail** inside the column (like shell panels). Switching to Form only / Table removes it from layout entirely.

---

## Open, collapse, and close

| Panel | Collapsed | Closed |
|-------|-----------|--------|
| Browse, Task list, Panel | **48px rail** — click to expand | Same as collapsed (toggle) |
| Assistant | — | **Fully hidden** — open via “Chat with AI” |

Collapsed panels keep a narrow rail. The Assistant is the exception: closed means gone from the layout, not minimized.

---

## Resizing panels

Drag the edge handle on an **open** panel to resize (not in hamburger / overlay mode).

| Panel type | Behavior |
|------------|----------|
| **Shell** (Browse, Task list, Assistant) | Grows or shrinks at the expense of the content column. Other open panels may shrink down to 24rem if space is tight. |
| **Panel** (in content area) | Splits space **inside** the middle column with the form or table — the column width stays the same. |

Open panels resize between **24rem** (min) and **56rem** (max).

---

## What happens when…

### …the user switches tabs?
- Content area swaps (form ↔ table, Panel on/off/left/right).
- **Browse, Task list, Assistant stay exactly as they were.**

### …the window gets narrower?
- Open panels **shrink** first (down to 24rem each).
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
| **Layout min** (content area + open panels) | **24** | **384** |
| Panel max (open) | 56 | 896 |
| Collapsed rail | 3 | 48 |
| Assistant closed | — | 0 |

The **24rem floor applies to the whole middle column** (header + form/table + Panel when shown). The Panel sits inside that column — its width is not added on top of the column in layout math.

The content-area Panel counts toward the “panels open” cap at each breakpoint, but only shell panels and the content floor count toward horizontal space outside the column.

Tables **do not wrap** — columns stay on one line. If the table is wider than the content area, it **scrolls horizontally** inside the table container (not the whole page).

### How many panels can be open?

**Details** (Phase 1: design for **896px and wider**)

| Window width | rem | Max open panels |
|--------------|-----|-----------------|
| ≥ 2304px | ≥ 144 | 4 |
| ≥ 1664px | ≥ 104 | 3 |
| ≥ 1280px | ≥ 80 | 2 |
| ≥ 896px | ≥ 56 | 1 |

**Bulk** (Phase 1: design for **896px and wider**)

| Window width | rem | Max open panels |
|--------------|-----|-----------------|
| ≥ 1280px | ≥ 80 | 2 |
| ≥ 896px | ≥ 56 | 1 |

Below those widths → **Phase 2** (hamburger / overlays). Not part of Phase 1.

---

## Phase 2 (ignore for now)

Narrow screens: hidden rails, panels as overlays. The prototype has experimental code for this — **don’t design or test against it yet.**

---

## For developers (short)

- **Constants:** `LAYOUT_MIN` / `PANEL_MIN` / `CONTENT_MIN` = 24rem · `PANEL_MAX` = 56rem · `COLLAPSED_W` = 48px.
- **State:** panel `open` is global; tabs only affect visibility and side of the content-area Panel (`rightA`).
- **Eviction:** runs on window **resize**, not tab change.
- **API:** `window.PanelFramework` — `setMode`, `setTab`, `open` / `close` / `toggle`, `getState`, `on` / `off`; events `mode-change`, `tab-change`, `breakpoint-change`, `open`, `close`, `resize`.

---

## Smoke test (5 minutes)

1. Switch all four Details tabs — shell panels don’t jump.  
2. Form + panel ↔ Panel + Table — Panel stays open, moves side.  
3. Form only ↔ Table — Panel hidden, then returns if not user-closed.  
4. Collapse Browse or Panel — rail remains; expand again. Assistant closes fully; reopen via “Chat with AI”.  
5. Resize an open shell panel and the content-area Panel.  
6. Narrow the window — panels close in order: Browse → Panel → Task list → Assistant.  
7. Bulk at ~896px+ — table scrolls inside its container if needed; page does not scroll sideways.
