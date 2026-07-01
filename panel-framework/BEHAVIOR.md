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

Each tab is a **different layout** for the content area — not the same layout with pieces turned off. Shell panels stay the same.

| Tab | Layout |
|-----|--------|
| **Form + panel** | Form + Panel on the **right** (metadata) |
| **Form only** | Form only — no Panel in this layout |
| **Table** | Table only — no Panel in this layout |
| **Panel + Table** | Table + Panel on the **left** (hierarchy) |

Where a tab includes the Panel, it is the same component — only position and content change.

**Switching tabs = switching layout.** Form only and Table are full-width content layouts; they do not include a Panel slot. Panel + Table and Form + panel do.

**Collapse (only on tabs that include the Panel).** The user can collapse the Panel to a **48px rail** inside the column. That is separate from changing tabs — it only applies when the current layout actually has a Panel.

**State carries over.** If the user collapsed the Panel on Form + panel, then switched to Table and back, the Panel is still collapsed — because that layout includes it again and we remember its open/collapsed state. We do not “hide” a Panel on Table; it simply is not part of that layout.

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
- The content area **changes layout** (form ↔ table; Panel included or not; left vs right).
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

The **24rem floor applies to the whole middle column** (header + whatever that tab’s layout contains). On tabs with a Panel, its width sits **inside** the column — not added on top.

At breakpoints, the Panel counts toward the “panels open” cap only on tabs whose layout includes it.

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
- **State:** panel `open` is global; tabs select which **layout** is active. The Panel only participates when the current tab’s layout includes it.
- **Eviction:** runs on window **resize**, not tab change.
- **API:** `window.PanelFramework` — `setMode`, `setTab`, `open` / `close` / `toggle`, `getState`, `on` / `off`; events `mode-change`, `tab-change`, `breakpoint-change`, `open`, `close`, `resize`.

---

## Smoke test (5 minutes)

1. Switch all four Details tabs — shell panels don’t jump; content area changes layout.  
2. Form + panel ↔ Panel + Table — Panel moves side; still part of the layout.  
3. Form only / Table — full-width layouts with no Panel. Return to Form + panel — Panel is back if the user hadn’t closed it.  
4. Collapse Browse or Panel — rail remains; expand again. Assistant closes fully; reopen via “Chat with AI”.  
5. Resize an open shell panel and the content-area Panel.  
6. Narrow the window — panels close in order: Browse → Panel → Task list → Assistant.  
7. Bulk at ~896px+ — table scrolls inside its container if needed; page does not scroll sideways.
