# Browse tables — user groups pattern

## The problem

For browse tables, under **Conditions for display**, we need to decide how admins set **who can see** a table.

We have two paths:

1. **Reuse the pattern we already use** for user groups elsewhere: an optional typeahead. Empty means visible to all users.  
2. **Introduce an explicit “All user groups” choice** (radios: All vs Specific), because browse tables also enforce **uniqueness**.

Elsewhere under Conditions for display, empty user groups already means **visible to all**. That meaning does not change. What is different for browse tables is uniqueness:

- Only **one** table can be “everyone” per object type  
- Only **one** table can use a given user group per object type  
- Users see the configuration that is **more specific** to their group  

So the question is not “what does empty mean?” — it already means everyone.  
The question is: **is empty-as-everyone still the best control when “everyone” can conflict with another table?**

---

## Recommendation

**Use All / Specific radios for browse tables** (explicit All), instead of relying on an empty typeahead alone.

We keep the same product meaning (no groups → all users). We change the **control** so All vs Specific is a deliberate choice where uniqueness is easy to break by accident.

---

## The uniqueness rule (same for both options)

A browse table is unique by **object type + who can see it**:

- **Everyone** = all users  
- **Specific** = one or more user groups  

You cannot have two tables that claim the same object type for everyone.  
You cannot have two tables that claim the same object type for the same user group.

---

## Option A — Explicit All / Specific *(recommended)*

**How it works**

- Admin chooses **All user groups** or **Specific user groups**  
- **All** = visible to everyone  
- **Specific** = must pick at least one group  
- If they pick Specific and leave without adding a group, we revert to All  

**Why choose this**

- Makes “everyone” an explicit choice when uniqueness matters  
- A second everyone table for the same object type can’t be created — All is disabled when taken  
- Under Specific, at least one group is required — “cannot be empty” is a normal mandatory-field rule  
- Conflicts are easy to explain: you can’t switch to All when an everyone table already exists  

**Tradeoff**

- Looks different from other Conditions user-group fields (one extra control)

---

## Option B — Reuse the usual typeahead

**How it works**

- Same chip field as elsewhere  
- Empty chips = visible to everyone (**same as other Conditions for display cases**)  
- Adding groups limits who sees the table  

**Why choose this**

- Matches the rest of the tool’s pattern and meaning  
- Fewer controls on screen  

**Why uniqueness still makes it awkward**

If we keep the usual optional typeahead and do **not** special-case it, admins can easily create two tables that both mean “Product for all users” (leave chips empty on create, or clear the last group on edit). Then it is unclear which table the end user should see — uniqueness is broken.

So we had to add a workaround: when an everyone table already exists for that object type, the last user-group chip cannot be removed (clearing it would become a second everyone table).

That workaround is hard to defend. On a **mandatory** field, “cannot be empty” is a normal rule. Here the field is **optional** — empty is a valid meaning (“everyone”), same as elsewhere. We do not have a clean argument for why this optional field sometimes cannot be cleared.

Pattern consistency is preserved in appearance only. Behaviour stops matching other optional user-group fields.

---

## Side-by-side

| | A — Explicit All / Specific | B — Reuse empty typeahead |
|---|---|---|
| Meaning of “no groups” | All selected | Empty chips (= all) — same as elsewhere |
| Matches other Conditions screens | No (extra radios) | Yes (looks the same) |
| Second everyone table (same object type) | Blocked (All disabled) | Easy without a workaround (empty = everyone) |
| “Cannot be empty” defendable? | Yes — Specific is mandatory | No — field is optional, empty is valid |
| Extra special cases for uniqueness | Few | Many (incl. last-chip lock) |

---

## Why we recommend explicit All

1. **Uniqueness** — only one everyone (and one per group) per object type. Without that, two everyone tables leave “which one does the user see?” unanswered.  
2. **Radios make Specific mandatory** — we can require at least one group without inventing a rule for an optional field.  
3. Reusing the optional typeahead forces a last-chip lock that other Conditions screens do not have — pattern consistency breaks in behaviour even if the control looks the same.

We are not saying empty means something new. We are saying uniqueness makes the usual optional control hard to defend here — so we prefer an **explicit All user groups** choice.

---

## One-line answer for stakeholders

> Elsewhere, empty user groups already means visible to all. Browse tables keep that meaning, but uniqueness means two everyone tables would conflict — and it would be unclear which one the user sees. Reusing the optional typeahead forces a workaround (sometimes you can’t clear the last group). We recommend All / Specific radios so “at least one group” is a normal mandatory rule under Specific, and All is an explicit choice that can be disabled when taken.

---

## Conflict message examples

- *Shoes (everyone) has already been configured for Product for all users.*  
- *Shoes (buyer group) has already been configured for Product for Buyer group.*

---

## Prototypes

- Full prototype: [index.html](./index.html) → Specific views → **Browse tables V1** (radios) and **Browse tables V3** (typeahead)  
- Edge walkthroughs: [radio-browse-tables-edge-walkthrough.html](./radio-browse-tables-edge-walkthrough.html) · [browse-tables-edge-walkthrough.html](./browse-tables-edge-walkthrough.html)  
- Create-modal rule: [CREATE-MODAL.md](./CREATE-MODAL.md)
