---
name: team-5-core-features
description: Use when the user wants to brainstorm, decide or list the core features of the system under test, define what the basic flow must cover, or map spec stories and rules to existing tests (traceability, coverage of the core flow).
---

# Core features brainstorm

The user decides what is core. You read the spec, trace it to the tests, ask one story at a time
and write down the answers. You never classify, recommend or invent features.

**Asking "this looks core, agree?" is classifying. A leading question is a decision made for the user.**

## Steps

1. **Pick the spec.** If the user named or attached a spec file, use it. Otherwise list the
   candidates you find (`spec/`, `*spec*.md`, `docs/`) and ask which one to use. Ask again if the
   file has no recognisable stories. Never pick a file silently, not even when there is only one.
2. **Pick the tests folder and output.** Default is the team folder the user works in
   (`teams/team-N/tests/`, output `teams/team-N/core-features.md`). If that is unclear, ask.
   If `core-features.md` already exists, read it and ask: continue, update or start over.
3. **Parse the spec.** A story is a heading with an ID (`## FD-05 · Cart`). Its rules are all the
   bullets under it, including any under a `Rules:` subsection. A requirement table (fields,
   values) counts as one rule. Tables of screenshots do not count. Number the rules in the order
   they appear: `FD-05.1`, `FD-05.2`, and so on. Skip `Not in scope`.
4. **Trace the tests.** Search the test titles (`test('…')`, `it('…')`) for each story ID. Match
   each test to a rule by its title. A test with the ID that fits no rule goes under
   *unmatched*. Tests without any spec ID are ignored.
5. **Go through the stories, one per message**, in spec order. Show:
   - the ID, title and the user-story sentence,
   - the numbered rules, each with its tests or `no test`,
   - one neutral question: *"Is <ID> a core feature of the basic flow? (yes / no / skip)"*.

   Wait for the answer. Write down the answer and any reason the user gives. Then go to the next story.
6. **Confirm the list.** Show the stories marked `yes` in spec order and ask whether that order
   matches the basic flow. Apply the user's reordering.
7. **Ask about extensions.** Ask: *"Is there a core feature of the basic flow that the spec
   does not describe?"* For each yes, ask what the user does and what should happen. Record it
   as `NEW-01`, `NEW-02` … with `not in spec`, `no test`. Repeat until the user says no.
8. **Write the output** (template below). Report: core count, rules without a test, new features.

## Output: `core-features.md`

```markdown
# Core features — <system> (spec: <path>)

## Basic flow
1. FD-01 · Browse restaurants → FD-03 · … → NEW-01 · …

## Core features
| # | ID | Feature | Source | Rules | Tested rules | Note |
| - | -- | ------- | ------ | ----- | ------------ | ---- |

## Traceability
### FD-05 · Cart
| Rule | Rule text (short) | Tests |
| ---- | ----------------- | ----- |
| FD-05.1 | Line shows dish, price, stepper | `tests/cart.spec.ts` › FD-05 · line shows… |
| FD-05.2 | Total = Subtotal − discount + fees | no test |
Unmatched: …

## Not core
| ID | Feature | Reason (user) |

## Skipped (no decision)
| ID | Feature |

## New core features (not in spec)
| ID | Feature | User action | Expected outcome |
```

## Rules

- Reply in the user's language. Keep IDs, rule texts and test titles as they are.
- Never edit the spec or the tests. The only file you write is `core-features.md`.
- Link a test only by the spec ID in its title. Never guess a link from the file name or the content.
- New features come only from the user. Do not propose any, not even as examples.

## Red flags — stop and ask instead

| Thought | Reality |
| ------- | ------- |
| "Checkout is obviously core, I'll pre-mark it" | The user decides. Ask neutrally. |
| "User is in a hurry, show all stories in one table" | One story per message. |
| "Only one spec file, no need to ask" | Confirm the spec before you parse it. |
| "I'll suggest a few missing features to speed it up" | Extensions come only from the user. |
| "This test probably covers FD-05.2" | No ID in the title = no link. |
