# Form Field Design System — Requirements & Constraints

## 1. Field Types

### 1.1 Single Value Field
- One value per field
- May support rich text formatting (bold, italic, underline, lists, links)
- May have character limit (e.g., 40 chars) with counter shown when editing

### 1.2 Multi Value Field
- Multiple values per field
- Values can be added, removed, reordered
- Each value may support rich text formatting
- May have character limit per value (e.g., 40 chars) with counter per row when editing

### 1.3 Reference Field
- Values are references to other entities
- Displayed as chips
- Can be single or multiple references
- Has two inheritance modes: **Additive** or **Replace-All** (see Section 4)

---

## 2. Field Metadata

Each field can have the following metadata:

| Metadata | Required | Description |
|----------|----------|-------------|
| Label | Yes | Field name displayed to user |
| Mandatory | No | Whether a value is required (configured by admin) |
| Help Text | No | Contextual help explaining the field (configured by admin, not always present) |

**Note**: Help text icon (ⓘ) should only appear if help text exists for that field.

---

## 3. Value Sources

A value can come from different sources:

| Source | Description | Editable? |
|--------|-------------|-----------|
| Local | User entered directly | Yes |
| Inherited | Comes from parent entity | Yes — editing creates override |
| Calculated | Computed/derived value | Yes — editing creates override |
| External | From external system | **No — truly readonly** |

**Note**: A value can have MULTIPLE sources simultaneously. For example:
- Inherited + Calculated (value is inherited AND computed)

### Override Mechanism
- **Inherited/Calculated**: User simply edits the value. The act of editing IS the override. Value becomes local.
- **External**: Cannot be overridden. Field is disabled/readonly.

---

## 4. Inheritance Behaviors

### 4.1 Single Value
- Shows inherited/calculated value
- User can edit directly — this creates an override
- Original value is replaced with local value
- Override is permanent (no undo in current scope)

### 4.2 Multi Value
- Shows inherited/calculated values
- User can edit any value directly — **this replaces ALL values with local values**
- Adding a new value — **also replaces ALL inherited values**
- Removing a value — **also replaces ALL inherited values**
- After override: all values are local/editable
- Override is permanent
- **Note**: Multi Value only supports replace-all behavior (system constraint)

### 4.3 Reference Field — Additive Mode (Multiple References Only)
- Inherited references shown but locked (cannot remove)
- User CAN add new references alongside inherited ones
- Result: mix of inherited (locked) + local (editable) references
- **This is the only mode where inherited values are preserved**
- **Note**: Only applies to multiple references. Single reference always replaces.

### 4.4 Reference Field — Replace-All Mode
- Inherited references shown but locked
- Adding any reference — **replaces ALL inherited references**
- After override: all references are local/editable

---

## 5. AI Capabilities

### 5.1 Two Dimensions of AI

AI has **two separate dimensions**:

| Dimension | What it is | When shown |
|-----------|------------|------------|
| **AI Action** (✦ button) | Action to generate content | Always available for editable fields |
| **AI Badge** (✦ AI activated) | Indicator that value was AI-generated | Only after AI was used |

### 5.2 AI Action
- **Always available** for editable fields (not external/readonly)
- Allows user to generate or regenerate content
- Operates at the field level (generates all values for multi-value)

### 5.3 AI Badge
- Only appears **after** AI was used to generate the value
- Informs user that current value came from AI
- Does NOT appear just because AI is available

### 5.4 After AI Generation
- Value becomes a **local** value (user can edit it)
- The source is "local", not "AI" — AI was just the method of creation
- The AI badge remains visible to indicate the origin

---

## 6. History

- All fields have change history
- User should be able to view history (shows last 5 changes in popover)
- History is at the field level, not value level
- If no history exists, popover shows "No history"

---

## 7. Validation & Errors

### 7.1 Field-Level (Attribute) Errors
- Validation errors that apply to the entire field
- Examples: "At least 3 values required", "At least 5 references are required"
- Shown as message above the input, always visible

### 7.2 Value-Level Errors
- Validation errors on specific values
- Examples: "Value must be at least 10 characters", "Invalid reference"
- Shown via error icon with tooltip on hover (icon visible, details on demand)

### 7.3 Error Display Requirements
- Attribute errors: visible without user action
- Value errors: error icon visible; details accessible via hover/click (tooltip)

---

## 8. Display Contexts

### 8.1 Form View
- Full editing experience
- Label visible
- All metadata accessible

**Layout Options:**
- Label on left (horizontal)
- Label on top (vertical)

### 8.2 Table View
- Compact display (one row per record)
- Multiple fields visible at once
- Must support inline editing

**States:**
- Collapsed: show value summary
- Editing: show edit interface

**Rich text in table:** Inline editing in cell; format toolbar in cell-actions bar; Aa toggles editing; cell border as bounding box.

---

## 9. User Actions

### 9.1 Always Available
- View history (all fields)

### 9.2 When Editable (not external)
- Edit value
- Generate with AI — **always available for editable fields**
- Add value (multi-value)
- Remove value (multi-value) — **triggers replace-all if inherited**
- Reorder values (multi-value)

### 9.3 When Inherited/Calculated
- Edit value (editing creates override, replaces inherited/calculated values)
- **Exception**: Reference Field in Additive Mode — can add without replacing

---

## 10. Visual Indicators Needed

Users need to understand at a glance:

| Information | Why Important | When shown? |
|-------------|---------------|-------------|
| Is field mandatory? | Know what's required | Only if mandatory |
| What's the value source(s)? | Understand where data comes from | Only if inherited/calculated/external |
| Is field readonly? | Know they cannot change it | Only if external (truly readonly) |
| Was value AI-generated? | Know the origin of current value | Only after AI was used (badge) |
| Are there errors? | Fix validation issues | Only if errors exist |
| Is help available? | Get more context | Only if help text configured |
| Was inheritance overwritten? | Know value was changed from inherited | Only after override of inherited value |
| Was calculated overwritten? | Know value was changed from calculated | Only after override of calculated value |

**Note on AI:**
- AI **action** (✦ button) is always available for editable fields
- AI **badge** (✦ AI activated) only appears after AI was used

---

## 11. Constraints

### 11.1 Space Constraints
- Table cells have limited width
- Form fields should not be cluttered
- Mobile/responsive considerations (future)

### 11.2 Cognitive Load
- Users should not be overwhelmed by indicators
- Most important information should be most visible
- Progressive disclosure preferred

### 11.3 Consistency
- Same field should look/behave consistently across contexts
- Patterns should be learnable

### 11.4 Accessibility
- Information should not rely solely on color
- Interactive elements need clear affordances
- Tooltips for icon-only elements

---

## 12. Decisions (Resolved)

| Question | Decision |
|----------|----------|
| Override confirmation? | **No** — no confirmation needed when overriding |
| Partial override (multi-value)? | **No** — it's all-or-nothing, editing any value replaces all |
| AI for specific values? | **Not for now** — AI operates at field level only |
| History granularity? | **Field level** is sufficient |
| Calculated + Editable? | **Yes** — editing directly overwrites the calculated value |

---

## 13. Priority of Information

When space is limited, what should be shown first?

**Proposed priority (high to low):**
1. Errors (critical — user must fix)
2. Mandatory indicator (critical — user must fill)
3. Value source (inherited/calculated — explains editability)
4. AI availability (helpful — but not critical)
5. Help text (icon only if configured, hover to view)
6. History (action, always available)

---

## 14. Layout & UI Decisions (Resolved in Prototype)

| Decision | Resolution |
|----------|------------|
| Where to show actions? | On hover/focus — AI, History, Format appear when user engages with field |
| Where to show badges? | With label (mandatory, help, source) or inline (AI badge) |
| When to show toolbar? | On hover / On focus |
| Toolbar scope | Per-field for form; per-cell for table |

See `DECISIONS.md` for full rationale.
