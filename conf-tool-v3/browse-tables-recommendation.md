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

We keep the same product meaning (no groups → all users). We change the **control** so All is explicit and disabled when taken — invalid everyone clashes are **prevented**, which matches how this tool usually avoids error states.

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
- Stays consistent with how this tool usually works: **prevent** invalid configurations, don’t leave the admin in an error state  
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

To keep the field optional, we would allow clearing the last group. Empty means everyone. When an everyone table already exists for that object type, *this* table becomes illegal — an **error** on that config, save blocked. The other everyone table stays valid.

That is workable, but it would be **the first time** in this configuration tool that we deliberately allow an error state instead of preventing it. Elsewhere we avoid letting admins land in invalid configurations. Radios keep that convention: All is disabled when taken, Specific requires at least one group — no error draft.

---

## Side-by-side

| | A — Explicit All / Specific | B — Reuse empty typeahead |
|---|---|---|
| Meaning of “no groups” | All selected | Empty chips (= all) — same as elsewhere |
| Matches other Conditions screens | No (extra radios) | Yes (looks the same) |
| Second everyone table (same object type) | Blocked (All disabled) | Allowed edit → error on that table; save blocked |
| Allows an error state in the config? | No — prevented | Yes — first time we would allow that here |
| Matches “avoid invalid configs” convention | Yes | No |

---

## Why we recommend explicit All

1. **Uniqueness** — only one everyone (and one per group) per object type.  
2. **This tool usually prevents errors** — we don’t leave admins in invalid configurations. Allowing clear-to-everyone → error would be a first.  
3. **Radios prevent the bad state** — All disabled when taken; Specific requires at least one group. Pattern consistency on the typeahead is not worth introducing error states.

We are not saying empty means something new. We are saying uniqueness + “avoid errors” favour an **explicit All user groups** choice over reusing the optional typeahead.

---

## One-line answer for stakeholders

> Elsewhere, empty user groups already means visible to all. Browse tables keep that meaning, but uniqueness means two everyone tables conflict. Reusing the typeahead would mean allowing an error on the table you just broke (first time we deliberately allow that in this tool). We recommend All / Specific radios so invalid everyone clashes are prevented — consistent with how we usually avoid error states.

---

## Conflict message examples

- *Shoes (everyone) has already been configured for Product for all users.*  
- *Shoes (buyer group) has already been configured for Product for Buyer group.*

---

## Prototypes

- Full prototype: [index.html](./index.html) → Specific views → **Browse tables V1** (radios) and **Browse tables V3** (typeahead)  
- Edge walkthroughs: [radio-browse-tables-edge-walkthrough.html](./radio-browse-tables-edge-walkthrough.html) · [browse-tables-edge-walkthrough.html](./browse-tables-edge-walkthrough.html)  
- Create-modal rule: [CREATE-MODAL.md](./CREATE-MODAL.md)
