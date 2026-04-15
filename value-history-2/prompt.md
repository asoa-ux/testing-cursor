# Prompt: Attribute History UI for MDM System

## Context

I'm designing a feature for a Master Data Management (MDM) system that allows users to view the change history of attributes on a record detail page.

## The Problem

Users occasionally need to see **who changed an attribute and when** — typically when they notice something looks wrong and want to investigate. They need to see at least the last 5 changes.

## Constraints

### Data Model
- **Single-value attributes**: e.g., "Vegetable" = "Banana"
- **Multi-value attributes**: displayed as separate input rows (not chips/tags), e.g., "Types of apples" with 3 separate text inputs for Gala, Fuji, Honeycrisp
- **History is tracked at the attribute level**, not per individual value
- **Some attributes have no local history** — they are synced from upstream systems (e.g., SAP ERP) and users need to understand this

### UI Constraints
- **Variable input widths**: Different attribute types have different input widths (text, dropdowns, numbers, lookups), so inline icons create inconsistent/unpredictable layouts
- **Info icon exists on SOME attributes** (to show attribute metadata), but not all — so we can't simply extend the info popover
- **Tabs are admin-configured**: We cannot rely on a dedicated "History" tab existing, because admins configure which tabs appear and may not include one
- **Users are focused on data editing** — history is a secondary concern and shouldn't add visual clutter to the main editing experience
- **Usage is occasional**, not constant — users don't need history visible all the time, only when investigating an issue

### User Needs
- Quick answer to "who changed this and when?"
- Ability to see the last 5 changes
- Clear indication when an attribute has no local history (upstream/synced)
- Shouldn't interfere with the primary editing workflow

## What I Need

Suggest UI patterns for accessing attribute history that:
1. Work consistently across all attribute types (single-value, multi-value, any width)
2. Don't add visual clutter to the edit UI
3. Are discoverable but not intrusive
4. Clearly communicate when history is unavailable (upstream attributes)
5. Fit naturally into an enterprise MDM application

## Reference

See the attached screenshot for the current UI layout, showing:
- Record header with revision info
- Tab navigation (Details, Compare, Asset, References, etc.)
- Attribute sections with labels on the left, values on the right
- Multi-value fields with multiple input rows and "+ Add new" link
- Info icons on some (not all) attribute labels
