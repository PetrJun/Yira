# Plán: Rozšíření Yira pro řízení bugfixingu (bakalářka)

## Kontext

Yira je Jira-like task tracker (React 18 + Express 4, bez DB). Rozšiřujeme ho o funkce specifické pro správu bugů:
stavový automat, oddělená severity/priority, typové rozlišení issues, základní reporting a snadné UI bez administrátora.
Všechny změny jsou aditivní — žádná existující data se nerozbijí.

---

## Checklist implementace

### Server

- [x] **1. enumState.js** — přidat `Severity`, `Priority`, `Type` vedle `State`
  - `Severity`: LOW, MEDIUM, HIGH, CRITICAL
  - `Priority`: LOW, MEDIUM, HIGH, URGENT
  - `Type`: BUG, FEATURE, IMPROVEMENT, TASK

- [x] **2. stateTransitions.js** — nový soubor `server/src/hellpers/stateTransitions.js`
  - Definovat povolené přechody pro bugfixing workflow:
    - TODO → INPROGRESS, CANCELLED
    - INPROGRESS → REVIEW, TODO, CANCELLED
    - REVIEW → DONE, INPROGRESS
    - DONE → INPROGRESS (znovuotevření)
    - CANCELLED → TODO (znovuotevření)
  - Exportovat `isValidTransition(fromState, toState)` → boolean

- [x] **3. taskFunctions.js** — výchozí hodnoty pro nová pole v `addFieldsToCreateTask()`
  - `severity = Severity.MEDIUM`
  - `priority = Priority.MEDIUM`
  - `type = Type.BUG`

- [x] **4. task/createAbl.js** — rozšířit ajv schema o `severity`, `priority`, `type`

- [x] **5. task/updateAbl.js** — rozšířit ajv schema + přidat validaci stavového přechodu
  - `isValidTransition(oldTask.state, dtoIn.state)` → 400 `invalidStateTransition` při neplatném přechodu

- [x] **6. getTasksAndProjectsOnUser.js** — přidat `filterByType`, `filterBySeverity`, `filterByPriority` do schema a logiky filtrování

---

### Client

- [ ] **7. TaskForm.js** — přidat 3 nové `<Form.Select>` (Typ, Severity, Priority)
  - State dropdown omezit na povolené přechody při editaci (jen validní next states)

- [ ] **8. TaskDetail.js** — zobrazit Typ, Severity, Priority jako read-only pole

- [ ] **9. Dashboard.js** — nové sloupce + filtrovací panel
  - Sloupce: `type` (110px), `severity` (110px, barevná), `priority` (110px, barevná)
  - Severity/Priority barvy: CRITICAL/URGENT=`#FF5733`, HIGH=`orange`, MEDIUM=`lightyellow`, LOW=`lightgreen`
  - Filtrovací panel: 3 `<Form.Select>` nad gridem (Type / Severity / Priority + "Vše")

- [ ] **10. Report.js** — nová stránka `client/src/Report.js`
  - Data z jednoho `fetch` na `getTasksAndProjectsOnUser`, agregace client-side
  - Tabulky/Cards: dle stavu, dle severity, dle priority, dle typu, dle projektu (top 5)

- [ ] **11. App.js** — přidat route `/report` → `<Report />`

- [ ] **12. NavBar.js** — přidat odkaz "Report"

---

## Ověření

- Vytvořit task → zkontrolovat výchozí severity/priority/type v JSON souboru `storage/taskList/`
- Pokusit se o nepovolený přechod stavu (např. TODO → DONE) → server vrátí 400 `invalidStateTransition`
- Dashboard filtry dle typu/severity/priority → grid zobrazuje jen odpovídající tasky
- Report stránka → počty sedí s manuálním počtem tasků ve storage