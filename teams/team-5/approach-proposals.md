# Team 5 · Jak na to — 3 návrhy

Tool týmu: **b · Coding agent + Playwright CLI**. Mise: AI-assisted test suite pro Foodora (FD-01 … FD-08) + aspoň jeden
`SKILL.md`, který agent spustí cold.

## Co rozhoduje o výhře

Battle (15:15–15:55): 3 nové stories `FD-09`–`FD-11`, 40 minut, nic nepřestavovat, tool neměnit. Sál hlasuje 1–5 na:

| | Otázka |
| --- | --- |
| 🚀 Speed | Kolik jste pokryli za 40 minut? |
| 🎯 Accuracy | Chytila by suite reálnou regresi? |
| 💡 Reusability | Funguje `SKILL.md` i zítra, na jiné app? |

Vyhraje ten, jehož skill umí zpracovat **novou story**, ne ten s nejhezčími testy na FD-01 … FD-08.
Skill proto nemá testovat jeden flow. Má vyrábět testy z jakékoliv story.

## Návrh 1 · Skill, který sám dopíše chybějící testy (doporučeno)

Skill `team-5-cover-spec`. Po `run team-5-cover-spec`, bez dalších slov, udělá:

1. Projde `spec/foodora-spec.md` a `spec/battle/` a vypíše všechna `FD-xx`.
2. Porovná je s názvy testů v `teams/team-5/tests/` a vezme **první story bez testu**.
3. Projde ji v app přes `npx playwright cli` (`FOODORA_URL`, jinak `https://foodora.lovable.app`).
4. Napíše **jeden test na každé pravidlo** story, název `FD-xx · <pravidlo>`, relativní `page.goto('/…')`.
5. Pustí `npx playwright test` z `teams/team-5/`.
6. Padající test roztřídí: chyba testu → max 2 opravy; rozpor app vs. spec → test zůstává červený a
   zapíše se do `README.md` jako nalezený bug.
7. Vypíše report: story, počet pravidel, PASS/FAIL, nalezené rozpory.

Proč: cold podmínka je splněná, protože agent si story najde sám z mezery v pokrytí. V Battle stačí
`git pull` + 3× `run`. Silné ve všech třech kritériích.

Riziko: jedna story ~4 minuty (v rehearsalu 2 stories za 8 minut). Řešení: dva notebooky paralelně.

## Návrh 2 · Pipeline s Playwright Test Agents (MCP)

Planner → generator → healer. Z každé story plán do `specs/`, pak testy, pak opravy. Skill jen řídí pořadí
a pravidlo „expected je ze spec, nikdy z app“.

- Plus: nejvíc struktury, pěkné plány na demo.
- Minus: jiný tool, než tým zvolil. Nejvíc setupu (`mcp.json`, restore před PR), pomalé, nejhůř přenositelné.
  Pro nás jen jako inspirace pro strukturu kroků.

## Návrh 3 · Nejdřív spec, bez browseru

Skill převede pravidla ze spec na matici `rule → test` a testy napíše rovnou ze spec a `spec/screens/`,
locatory podle role a textu.

- Plus: nejrychlejší, funguje na jakoukoliv app se spec.
- Minus: locatory se hádají → první běh padá na selektorech, ne na bugách. Slabé na Accuracy.
- Pro nás jako **fallback**: když CLI na notebooku nepojede, Návrh 1 bez kroku 3 je Návrh 3.

## Doporučení: Návrh 1

**Z čeho vychází.** Battle zadá „nová story → testy za pár minut“, Návrh 1 pro to staví stroj. Hlasuje sál
po 3minutovém demu — nejsilnější moment je „tohle jsme chytili“, a to dává pravidlo „rozpor se spec = červený test“.

**Co musí platit.**
- `npx playwright cli` běží na driverově notebooku. Ověřit ve 13:00 jedním `open` + `snapshot`.
- `FD-09`–`FD-11` mají stejný formát jako FD-01 … FD-08 (pravidla pod **Rules**).
- Nikdo agentovi neradí během cold runu.

**Limity.**
- Detekce mezer podle `FD-xx` v názvu je křehká: test bez `FD-xx ·` na začátku = story se pokryje znovu.
- Tým na stejném toolu s lepší disciplínou nás porazit může. Rozdíl pak dělá kvalita `SKILL.md`.

## Pravidla do `SKILL.md` (rozhodují o Accuracy)

- Expected výsledek je vždy ze spec. **Nikdy** neupravuj assertion podle toho, co app ukazuje.
- Rozpor app vs. spec: test nech červený, citát ze spec + co app ukázala zapiš do `README.md`.
- Jeden test na pravidlo. Dlouhý test skončí na první chybě a zbytek pravidel se nezkontroluje.
- Každý test začíná `FD-xx ·`. Adresu app nikdy do testu — jen `baseURL` z configu.
- Po každém kliku nový `snapshot`: refs se mění.

## Rozdělení týmu (4 lidi)

| Kdo | Co dělá |
| --- | --- |
| Driver | Pouští skill na hlavním notebooku, pushuje |
| Druhý notebook | Pouští skill paralelně na jiné story (pozor na konflikty v `tests/` — každý svůj soubor na story) |
| Spec reader | Čte další story, hlídá, že testy sedí na pravidla, sbírá bugy na demo |
| Skill owner | Ladí `SKILL.md`, zkouší cold run po novém chatu |

## Checkpointy

| Čas | Máme |
| --- | --- |
| 13:30 | První test zelený (FD-01, ručně s agentem) |
| 14:00 | `SKILL.md` draft, přejmenovaný na `team-5-cover-spec` (složka + `name:`) |
| 14:20 | Cold run pokryje jednu story bez nápovědy |
| 14:30 | Pushnuto, PR aktuální |
| 15:15 | `git pull --no-rebase --no-edit upstream main`, `.env` → `foodora-new`, 3× `run` |
| 15:55 | Demo: co jsme pokryli, jeden chycený bug, jak pomohl skill |

## Otevřené otázky

| Otázka | Dopad | Kdo odpoví |
| --- | --- | --- |
| Jede driver v Copilot, nebo v Claude Code? | Claude Code čte skills z `.claude/skills/`, ne z `.github/skills/` — skill by se nenašel a cold run by padl. | Tým 5 |
