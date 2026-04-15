# MDM Form Field Design — Prototype v2: Design Decisions

This document captures the design decisions made in the prototype. It serves as a reference for implementation and future iterations.

---

## 1. Layout & Information Architecture

### 1.1 Info stays with label
- **Decision:** Mandatory (*), Help (ⓘ), and source badges (Inherited, Calculated, External, etc.) are part of the field's identity and appear with the label.
- **Rationale:** Keeps field metadata visible and associated with the field name.

### 1.2 Actions appear on focus/hover
- **Decision:** AI action (✦), History (⏱), and Format (Aa) buttons are hidden by default and shown when the user hovers or focuses the field.
- **Rationale:** Reduces visual clutter; actions appear when the user is engaged with the field.

### 1.3 Form layouts
- **Decision:** Support two layouts — Label Left (horizontal) and Label Top (vertical).
- **Rationale:** Accommodates different form densities and user preferences.

### 1.4 Table view
- **Decision:** Table cells show a compact summary; editing happens inline or via popover depending on field type.
- **Rationale:** Table view prioritizes scanability; full editing is available on interaction.

---

## 2. Field Types & Patterns

### 2.1 Single value
- **Decision:** One input per field; supports character limit (40 chars) with counter.
- **Rationale:** Standard text input pattern; character counter helps users stay within limits.

### 2.2 Multi value
- **Decision:** List of inputs with add/remove/reorder; each row has its own character counter.
- **Rationale:** Clear list metaphor; each value is independent.

### 2.3 Reference (chips)
- **Decision:** Values displayed as chips; add by typing and confirming; remove via × on chip.
- **Rationale:** Chips are a familiar pattern for multi-select and references.

### 2.4 Rich text
- **Decision:** Textarea with formatting toolbar (Bold, Italic, Underline, lists, Link).
- **Rationale:** Supports structured content without full WYSIWYG complexity.

---

## 3. Value Sources & Override Behavior

### 3.1 Inherited
- **Decision:** User can edit; editing creates an override. Badge changes to "Inheritance overwritten."
- **Rationale:** Editing is the explicit act of overriding; no separate "override" button.

### 3.2 Calculated
- **Decision:** Same as inherited — editing creates override. Badge changes to "Calculated overwritten."
- **Rationale:** Consistent mental model across derived sources.

### 3.3 External
- **Decision:** Truly readonly; field is disabled. No override possible.
- **Rationale:** External systems own the data; user cannot change it.

### 3.4 Single value: No gray styling for inherited/calculated
- **Decision:** Inherited and calculated single values do not use a gray background.
- **Rationale:** Avoids making the field look disabled when it is editable.

### 3.5 Multi value: Gray styling for inherited/calculated
- **Decision:** Inherited/calculated multi-value rows use subtle gray background (#f5f5f5).
- **Rationale:** Distinguishes source while keeping rows editable.

---

## 4. Reference Field Modes

### 4.1 Additive mode (multiple references only)
- **Decision:** Inherited references are locked; user can add new references alongside them.
- **Rationale:** Preserves inherited data while allowing extension.

### 4.2 Replace-all mode
- **Decision:** Adding any reference replaces all inherited references.
- **Rationale:** User takes full ownership of the field.

### 4.3 Inherited chips in table
- **Decision:** Inherited chips show inherited icon + lock; same pattern in form and table.
- **Rationale:** Consistent visual language across views.

### 4.4 Reference editing
- **Decision:** For inherited references, editing happens inline in the cell; popover shows only messages (info or errors).
- **Rationale:** Keeps editing context close to the data.

---

## 5. Validation & Errors

### 5.1 Two levels of errors
- **Decision:** Attribute-level errors (field required, min values) vs value-level errors (invalid value, min length).
- **Rationale:** Different scopes require different treatment.

### 5.2 Attribute errors
- **Decision:** Shown as a message above the input, always visible. Uses error-message styling (icon + text).
- **Rationale:** User must see field-level requirements.

### 5.3 Value errors
- **Decision:** Shown via error icon with tooltip on hover. Icon appears next to the invalid input/chip.
- **Rationale:** Keeps UI compact; details on demand. (Note: accessibility concern — see Concerns.)

### 5.4 Error messages (prototype copy)
- **Decision:** Use specific messages:
  - Single: "Name must be at least 10 characters"
  - Multi: "At least 3 values are required" (attribute); "Value must be at least 10 characters" (value)
  - Reference: "At least 5 references are required" (attribute); "Invalid reference" (value)
  - Richtext: "Content must be at least 100 characters"
- **Rationale:** Demo values for prototype; real system would use configurable messages.

---

## 6. Character Counter

### 6.1 Max length
- **Decision:** 40 characters for single and multi-value inputs.
- **Rationale:** Prototype constant; real system would be configurable per field.

### 6.2 Display
- **Decision:** Format "0/40 characters"; shown below input, right-aligned.
- **Rationale:** Standard pattern; right alignment keeps it unobtrusive.

### 6.3 Visibility
- **Decision:** Character counter only visible when editing (input focused).
- **Rationale:** Reduces clutter when not needed.

### 6.4 Table cell
- **Decision:** Character counter appears below the cell, right-aligned, when editing.
- **Rationale:** Keeps counter accessible without crowding the cell.

---

## 7. Rich Text in Table

### 7.1 No popover
- **Decision:** Rich text editing is inline in the cell; no popover.
- **Rationale:** Reduces context switching; editing stays in place.

### 7.2 Toolbar in cell-actions
- **Decision:** When user clicks Aa, the cell-actions bar expands to include format buttons (B, I, U, •, #, 🔗).
- **Rationale:** Reuses existing toolbar space; no separate toolbar row.

### 7.3 Aa toggles editing
- **Decision:** Clicking Aa again hides the format actions and exits edit mode.
- **Rationale:** Clear toggle; user controls when to edit.

### 7.4 Cell provides bounding box
- **Decision:** Textarea has no border; the table cell's border defines the boundary.
- **Rationale:** Avoids double-border; cleaner visual hierarchy.

### 7.5 Mandatory marker position
- **Decision:** When editing, mandatory marker (*) keeps its Y position (align-items: flex-start); extra padding on cell-markers only.
- **Rationale:** Marker should not move when cell expands; text stays in place.

---

## 8. AI

### 8.1 Two dimensions
- **Decision:** AI Action (✦ button) always available; AI Badge (✦ AI activated) only after AI was used.
- **Rationale:** Action is capability; badge is provenance.

### 8.2 Badge label
- **Decision:** Badge text is "✦ AI activated" (not "AI generated").
- **Rationale:** Reflects that AI was activated/used rather than implying the value was fully generated.

### 8.3 AI action placement
- **Decision:** AI button appears in the actions bar (with History, Format) for all editable fields.
- **Rationale:** Consistent placement; always available when user can edit.

---

## 9. Sync & State

### 9.1 Sync across views
- **Decision:** Changes in Label Left, Label Top, or table sync to all other views in real time.
- **Rationale:** Single source of truth; no stale state.

### 9.2 Multi-value sync
- **Decision:** Preserve empty values when syncing; use `input[data-field="multi"]` for collection.
- **Rationale:** Empty rows are valid (user may be typing); don't drop them.

### 9.3 Inherited/calculated chip styling on sync
- **Decision:** When syncing multi-values to table, preserve inherited/calculated chip classes if container still has data-inherited/data-calculated.
- **Rationale:** Styling should persist until user overrides.

---

## 10. Concerns (Open Items)

The following are documented as concerns — not yet resolved:

1. **Multi-value vs Multi-reference** — Do we need two different patterns?
2. **Errors** — Displayed on hover (not very accessible).
3. **Cell actions** — Hidden by default; users may not discover AI, History, or Format actions.
4. **Character counter** — Only visible when editing; screen readers may not announce limits.
5. **Validation feedback** — Value errors in tooltips vs attribute errors in popover; inconsistent patterns.

---

## 11. Technical Notes

### 11.1 Removed code
- `syncMultiValueViews` was removed; `syncAllViews` and `updateMultiValueView` handle multi-value sync.

### 11.2 Convert functions
- `convertToOverridden` / `convertToCalculatedOverridden` apply to single container.
- `convertToOverriddenAllViews` / `convertToCalculatedOverriddenAllViews` apply across all preview areas.
- Richtext is included in convert logic for inherited/calculated overwritten behavior.

### 11.3 Close behavior
- Table cell editing closes on click outside.
- Rich text toolbar hides on click outside (form view).
