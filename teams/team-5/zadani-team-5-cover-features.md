# Zadání: skill team-5-cover-features

## Cíl
Jeden cold run (`run team-5-cover-features`) projde přehled core features a každou nepokrytou
pokryje testem. Slouží pro Build (FD-01 … FD-08) i Battle (FD-09 … FD-11): po `git pull`
stačí pustit skill znovu.

## Výstup
- `.claude/skills/team-5-cover-features/SKILL.md` (Claude Code; nahradí `.github/skills/team-5-my-skill/`)
- testy v `teams/team-5/tests/`, seed `teams/team-5/tests/seed.spec.ts`, plány v `teams/team-5/specs/`
- aktualizovaný `teams/team-5/core-features.md`
- Playwright HTML report `teams/team-5/playwright-report/index.html`

## Scope
- Čte `teams/team-5/core-features.md` (dodá kolega přes git pull, formát zatím neznámý).
- Řádek bez test IDs = nepokrytý. Zpracuje **všechny nepokryté, jeden po druhém**.
- Pro každý: najde FD-xx → pravidla ze `spec/foodora-spec.md` nebo `spec/battle/` →
  postup z `.github/agents/playwright-test-planner.agent.md` (plán) → postup z
  `.github/agents/playwright-test-generator.agent.md` (test) → `npx playwright test` → zápis do řádku
  **hned** (přerušený běh nic neztratí).
- Na konci jeden běh celé suite → HTML report.

## Ne-scope
- Healer agent. Test se nikdy neohýbá podle app.
- Vlastní dashboard. Dashboard = HTML report + stav v tabulce.
- `.claude/agents/`, `.mcp.json`, `.vscode/mcp.json`, cokoliv mimo `teams/team-5/` a složku skillu.
- Úprava `playwright.config.ts` (baseURL, reportery).

## Vstupy
- Zdroj pravdy pro expected: spec, nikdy app.
- MCP: `claude mcp add playwright-test --scope local -- npx playwright run-test-mcp-server --config teams/team-5`
  (jednorázově na driverově notebooku, mimo repo).
- Adresa: `FOODORA_URL` z `.env`, jinak `https://foodora.lovable.app`.

## Akceptační kritéria
- [ ] Každý řádek s FD-xx má v `core-features.md` test IDs (`FD-xx · <pravidlo>`) a status.
- [ ] Status PASS = test passed. Status BUG = test červený, app odporuje spec, u řádku citát ze spec + co app ukázala.
- [ ] HTML report existuje a odpovídá poslednímu běhu celé suite.
- [ ] Cold run: nový chat po `/clear`, jen `run team-5-cover-features`, žádný další prompt.
- [ ] Druhý run na plně pokrytém souboru nic nového nevyrobí a jen pustí suite.

## Constraints
- Tool týmu se mění z b na c (README týmu upravit). Pak už beze změny do Battle.
- Checkpointy: 13:30 první zelený test, 14:00 draft skillu, 14:20 cold run.
- Soubor `core-features.md` přijde až od kolegy → dřív se dá skill testovat jen na dočasné kopii.

## Předpoklady
- Stavy: PASS · BUG · FAIL (test se nepodařilo rozchodit) · SKIPPED (řádek bez FD-xx).
- Selhání na selektoru = chyba testu, ne bug: max 2 opravy, pak FAIL. BUG jen když prvek je, ale
  chování odporuje citovanému pravidlu.
- Chybí sloupce pro testy/status → skill je přidá na konec tabulky, stávající sloupce nemění.
- Soubor chybí → skill skončí s hláškou, nic negeneruje.
- Pass až na retry (`retries: 1`) = PASS, s poznámkou „flaky“.
- Jeden test na pravidlo, ne jeden test na story.
- `approach-proposals.md` (Návrh 1 = CLI) je tím zastaralý.

## Otevřené otázky

| Otázka | Dopad | Kdo odpoví |
| --- | --- | --- |
| Přesný formát `core-features.md` (sloupce, kde je FD-xx)? | Parsing a zápis. Do té doby platí předpoklad „přidat sloupce“. | kolega, který soubor dodá |
| Stačí jeden kontext pro 8+ features, nebo se zahltí? | Možná bude potřeba dávka po 3–4. Ověří až první celý run. | tým 5 během Buildu |
