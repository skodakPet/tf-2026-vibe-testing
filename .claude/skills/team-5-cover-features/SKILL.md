---
name: team-5-cover-features
description: Use when the user says "run team-5-cover-features" or wants to cover Foodora core features from teams/team-5/tests/core-features.md with Playwright tests (plan → generate → run → write results back, HTML report).
---

# Cover core features

Phase 2 of the Team 5 flow. The human decided WHAT is core (`core-features.md`). You cover it.
Cold run: no questions to the user, work to the end.

## Steps
1. Read `teams/team-5/tests/core-features.md`. Missing → say so and stop, generate nothing.
2. In `## Core features` take every ID. Skip IDs listed under `## Not core`.
   For each ID collect the rules in its `## Traceability` table whose `Tests` cell is `no test`.
   No such rules anywhere → skip to step 5 (a second run only runs the suite).
3. For each ID with untested rules, **one at a time, in basic-flow order**:
   1. Agent `team-5-planner`: give it the ID and the untested rules (ID + short text).
   2. Agent `team-5-generator`: give it the plan path `teams/team-5/specs/FD-xx.md`.
   3. **Immediately** update `core-features.md` from the generator's lines:
      - Traceability row: `Tests` = `` `tests/fd-xx.spec.ts` › <test title> ``. Add a `Status` column
        at the end of the table if missing and fill PASS / PASS (flaky) / BUG / FAIL.
        BUG / FAIL detail goes into the `Status` cell after a dash (spec quote vs. app).
      - `## Core features` row: `Tested rules` = number of rules that now have a test.
      - Never change other columns, rule texts or the order of rows.
4. Next ID.
5. Run the whole suite once: `cd teams/team-5 && npx playwright test --project=chromium`
   (red tests are expected when there are BUGs). Report: `teams/team-5/playwright-report/index.html`.
6. Report: per ID `tests / PASS / BUG / FAIL`, the BUG list with spec quotes, the report path.

## Rules
- Expected results only from `spec/foodora-spec.md`. Never change a test to match the app. No healer.
- Never edit the spec, never touch other teams' folders. Write only into `teams/team-5/`.
- Update `core-features.md` after EACH feature, so an interrupted run loses nothing.
- Never run planner / generator for rules that already have a test.
