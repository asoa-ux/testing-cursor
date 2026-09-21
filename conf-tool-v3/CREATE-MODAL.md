# Create modal: when optional fields are allowed

## Default rule

Create modals only include **mandatory** fields. Optional configuration is done on the detail view after create.

This keeps create fast, avoids unfinished-looking forms, and matches the rest of Configuration tool.

## Exception

An optional field may appear in the create modal when **all** of the following are true:

1. **The empty value is a real configuration choice**, not “fill in later.”  
   Example: empty user groups means “visible to all users,” not “not configured yet.”

2. **That choice participates in uniqueness or identity.**  
   Creating with the default empty value would claim a slot (e.g. object type + everyone). The admin must be able to set a non-default value *before* Create, or they cannot create a valid sibling config (e.g. group-scoped table when an everyone table already exists).

3. **Deferring the field to the detail would force an invalid or unsavable draft**, or block a legitimate create path.

If the field is only polish (description, columns, notes), keep it off the create modal.

## Current case: Browse tables (user groups)

| | |
|---|---|
| **Pattern** | Typeahead under User groups (same as elsewhere). Empty = visible to all users. |
| **Why on create** | Uniqueness is object type + user group (or empty = everyone). Without groups on create, a new table always starts as everyone and conflicts when an everyone table already exists for that object type. |
| **How we explain it** | Create modal: hint **below User groups** — “This browse table will be visible to all users unless you select specific user groups.” Detail (after create): Conditions hint — “You must specify 1 or more object types for this table to be displayed. It will be visible to all users unless you select specific user groups.” Do not rely on the `i` icon alone for this rule — `i` is for field definition, not default behavior. |
| **Validation** | Create stays disabled (with conflict messaging) when the object type + scope combination already exists. Object types remain pickable so the admin can add a free user group and then Create. |

## When not to use the exception

- Empty does **not** mean a product default (it means incomplete).
- The field does not affect uniqueness or create validity.
- Radios or another explicit required choice already capture the same decision at create.

## Decision checklist

Before adding an optional field to a create modal, confirm:

- [ ] Empty is a deliberate, valid saved state
- [ ] That state is needed at create for uniqueness or a valid create path
- [ ] Visible hint (not only `i`) explains the empty default
- [ ] Create is blocked when the resulting combination is invalid
