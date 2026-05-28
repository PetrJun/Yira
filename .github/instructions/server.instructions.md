---
applyTo: "server/**"
---

# Server — Instruction Set

## Stack

| Layer | Library |
|---|---|
| Runtime | Node.js |
| HTTP framework | Express 4 |
| CORS | `cors` middleware (open, no allowlist) |
| Validation | `ajv` + `ajv-formats` (JSON Schema draft-07) |
| Mailer | `nodemailer` (SMTP) |
| Storage | Plain JSON files on disk — no database |
| ID generation | `crypto.randomBytes(16).toString("hex")` (32-char hex) |

Entry point: `server/app.js`. Start with `npm start` (alias for `node app.js`). Listens on **port 8000**.

---

## Architecture

The server uses a strict **Controller → ABL → DAO** layering. Each domain (**user**, **project**, **task**) has its own slice across all three layers.

```
src/
  controller/        Express routers — one file per domain, only route wiring
    user.js
    project.js
    task.js
  abl/               Application Business Logic — one file per use case
    user/
    project/
    task/
  DAO/               File-system persistence — one file per domain
    userDAO.js
    projectDAO.js
    taskDAO.js
    storage/         JSON files live here (userList/, projectList/, taskList/)
  hellpers/          (sic — keep the spelling) shared helpers
  templates/         HTML email templates
```

### Layer responsibilities

- **Controller** — only wires Express routes to ABL functions. No logic, no validation, no DAO calls.
- **ABL** — one file per use case (`createAbl.js`, `updateAbl.js`, `deleteAbl.js`, `getAbl.js`, …). Owns input validation, authorization checks, orchestration of DAO calls, and side effects (email). Always exported as a single `async function XxxAbl(req, res)` with `module.exports = XxxAbl`.
- **DAO** — only file I/O. Exposes `{ get, create, update, remove, list }`. Never imports from `abl/` or `controller/`.

---

## Controller conventions

Each controller is a thin Express `Router`. Pattern:

```js
const express = require("express");
const router = express.Router();

const CreateAbl = require("../abl/<domain>/createAbl");
// ...

router.post("/create", CreateAbl);
router.delete("/delete/:<domain>Id/:userId", DeleteAbl);
router.get("/get/:id", GetAbl);
router.put("/update/:<domain>Id/:userId", UpdateAbl);
router.patch("/updateAssigneeUser/:<domain>Id/:assigneeId/:userId", UpdateAssigneeUserAbl);

module.exports = router;
```

Mounted in `app.js` as `/api/user`, `/api/project`, `/api/task`.

### Route shapes (match exactly — the client depends on these)

| Method | Path | ABL |
|---|---|---|
| GET | `/api/user/list` | `user/listAbl` |
| GET | `/api/user/get/:id` | `user/getAbl` |
| POST | `/api/user/create` | `user/createAbl` |
| PUT | `/api/user/update/:id` | `user/updateAbl` |
| DELETE | `/api/user/delete/:id` | `user/deleteAbl` |
| GET | `/api/project/get/:id` | `project/getAbl` |
| GET | `/api/project/getTasksAndProjectsOnUser/:userId` | `project/getTasksAndProjectsOnUser` |
| POST | `/api/project/create` | `project/createAbl` |
| PUT | `/api/project/update/:projectId/:userId` | `project/updateAbl` |
| DELETE | `/api/project/delete/:projectId/:userId` | `project/deleteAbl` |
| PATCH | `/api/project/updateAssigneeUser/:projectId/:assigneeId/:userId` | `project/updateAssigneeUserAbl` |
| GET | `/api/task/get/:id` | `task/getAbl` |
| POST | `/api/task/create` | `task/createAbl` |
| PUT | `/api/task/update/:taskId/:userId` | `task/updateAbl` |
| DELETE | `/api/task/delete/:taskId/:userId` | `task/deleteAbl` |
| PATCH | `/api/task/updateAssigneeUser/:taskId/:assigneeId/:userId` | `task/updateassigneeUserAbl` |

`userId` in the URL is the **acting user** (authorization subject), `assigneeId` is the **target user** for reassignment. Do not rename these params — the client builds URLs from them.

---

## ABL file template

Every mutation ABL follows the same shape. Stick to it.

```js
const Ajv = require("ajv");
const ajv = new Ajv();

const xxxDAO = require("../../DAO/xxxDAO.js");
const userDao = require("../../DAO/userDAO.js");
const { State } = require("../../hellpers/enumState.js");
const { validateDateTime } = require("../../hellpers/validateDatetime.js");
const sendMail = require("../../hellpers/sendMail.js");

ajv.addFormat("date-time", { validate: validateDateTime });

const schema = {
    type: "object",
    properties: { /* ... */ },
    required: [ /* ... */ ],
    additionalProperties: false,
};

async function XxxAbl(req, res) {
    try {
        // 1. validate input
        const valid = ajv.validate(schema, req.body);
        if (!valid) {
            res.status(400).json({
                code: "dtoInIsNotValid",
                message: "dtoIn is not valid",
                validationError: ajv.errors,
            });
            return;
        }

        // 2. authorization / business checks (return early on failure)

        // 3. DAO call

        // 4. fire-and-forget email if assignee !== acting user

        res.json(result);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
}

module.exports = XxxAbl;
```

### Rules

- Always wrap the whole body in `try/catch`. Catch returns `{ message: e.message }` with status `500`.
- Always `return` after `res.status(...).json(...)` — never let execution fall through.
- Error responses use a `code` (camelCase string identifier) plus a human-readable `message` or `note`. Reuse existing codes when applicable: `dtoInIsNotValid`, `usersNotFound`, `projectNotFound`, `taskNotFound`, `usersCantCreateProject`, `userCantUpdateTask`, `userCantDeleteTask`, `userCantBeAssignedOnTask`, `userCantBeAssignedOnProject`, `userCantUpdateAssigneeUser`, `emailAlreadyExists`.
- One file per use case under `abl/<domain>/`. Naming: `createAbl.js`, `updateAbl.js`, `deleteAbl.js`, `getAbl.js`, `updateAssigneeUserAbl.js`. (Task’s file is `updateassigneeUserAbl.js` — lowercase `a`. Don’t rename it without updating the controller import.)

---

## Validation (ajv) conventions

- One `ajv` instance per ABL file, declared at the top.
- `ajv.addFormat("date-time", { validate: validateDateTime })` — use the local helper, **not** `ajv-formats`, for `date-time`. (`ajv-formats` is only used in `user/createAbl.js` for `email`.)
- ID fields are validated as strings with `minLength: 32, maxLength: 32` (the hex length produced by `crypto.randomBytes(16)`).
- `state` uses `enum: Object.values(State)` from `hellpers/enumState.js`.
- `additionalProperties: false` on every schema.
- Description max length is `500`.
- On create schemas, list `required` fields explicitly. Update schemas have no `required` block (partial updates are allowed).

### Domain field shapes

**Project**
```
{ name, createdBy, assigneeUser, state, deadline, estimate, worked, description, userList[] }
```
Required on create: `name, createdBy, deadline, estimate, description, userList`.

**Task**
```
{ projectId, name, createdBy, assigneeUser, state, deadline, estimate, worked, description }
```
Required on create: `projectId, name, deadline, createdBy, estimate, description`.

**User**
```
{ name, surname, email, role }
```
`role` ∈ `"projectManager" | "teamMember"`. `email` must be unique (checked in `user/createAbl`).

### Defaulting (in `hellpers/projectFunctions.js` and `taskFunctions.js`)

- If `assigneeUser` is missing on create → defaults to `createdBy`.
- If `state` is missing on create → defaults to `State.TODO`.
- `createdAt` is set in the ABL with `new Date().toISOString()` (not in the DAO).

---

## Authorization rules

Implemented inline in each ABL — there is no central middleware.

| Action | Allowed when |
|---|---|
| Create project | `userDAO.get(createdBy).role === "projectManager"` |
| Update project (any field) | acting `userId === project.createdBy` |
| Delete project | acting `userId === project.createdBy` |
| Reassign project | acting `userId === project.createdBy` **and** `assigneeId ∈ project.userList` |
| Create task | acting user is in `project.userList` (`userOnTask`) **and** assignee is in `project.userList` |
| Update task | acting `userId ∈ project.userList` (`userOnTask`) |
| Delete task | acting `userId ∈ project.userList` (`userOnTask`) |
| Reassign task | acting `userId ∈ project.userList` **and** `assigneeId ∈ project.userList` |

Use the existing helpers — do not reimplement these checks:
- `hellpers/taskFunctions.js`: `userOnTask(userId, projectId)`, `existsProjectId(projectId)`
- `hellpers/projectFunctions.js`: `existingUsersInProject(userIdList)` — returns the list of IDs that are **not** users (the variable is named `notExistingUsers` at call sites).

---

## DAO conventions

All three DAOs are identical in shape. **Do not** add query parameters, filtering, or pagination — filtering happens in the ABL.

```js
function get(id) { ... }            // returns object or null on ENOENT
function create(obj) { ... }        // assigns obj.id, writes <id>.json, returns obj
function update(obj) { ... }        // merges {...current, ...obj}, returns merged
function remove(id) { ... }         // unlink, returns {} (idempotent on ENOENT)
function list() { ... }             // returns array of all JSON files in folder
```

- IDs are generated **in the DAO `create`** via `crypto.randomBytes(16).toString("hex")`. ABL must not pass an `id` in the body of a create.
- Each entity is stored as `src/DAO/storage/<domain>List/<id>.json`. Folder names are: `userList`, `projectList`, `taskList`.
- DAO errors are thrown as `{ code: "failedToXxxYyy", message: error.message }` and surface as HTTP 500 via the ABL `catch`.
- `get` returning `null` is the contract for "not found". ABLs must check for `null` and return a 404 with the appropriate `code`.

---

## Email notifications

Email is a **side effect** triggered from ABLs after a successful DAO call. The rule everywhere:

> Skip the email when `createdBy === assigneeUser` (or, for task delete, when the acting user === assignee). Send only when the assignee is a different person.

Send with:

```js
const sendMail = require("../../hellpers/sendMail.js");

sendMail({
    sender,           // optional, name of acting user
    recipient,        // name of assignee user
    recipientMail,    // assignee email
    taskId, taskName, taskNameNew,
    projectId, projectName, projectNameNew,
}, "<templateName>");
```

`sendMail` is fire-and-forget — do not `await` it, do not block the response on it. Errors are logged to console.

### Template names (note the `Notfication` typo — keep it)

- `createTaskNotfication`
- `deletedTaskNotification`
- `updateTaskNotfication`
- `updateTaskNameNotfication`
- `updateTaskAssigneeUserNotfication`
- `createProjectToAssignedUserNotfication`
- `deletedProjectNotification`
- `updateProjectNotfication`
- `updateProjectNameNotfication`
- `updateProjectAssigneeUserNotfication`

When adding a new template:
1. Drop the HTML file in `src/templates/`.
2. Add a `path.join` constant at the top of `hellpers/sendMail.js`.
3. Add a `case` in `createEmailTemplate(template)`.
4. Add an `else if` branch in `createDataForMailDistribution` to replace placeholders and set the subject.

Update-vs-update-name: when a mutation changes the entity name, send the `*NameNotfication` variant (carrying `taskNameNew` / `projectNameNew`) instead of the plain update variant. See `project/updateAbl.js` and `task/updateAbl.js` for the pattern.

---

## Response shape

- **Success**: `res.json(<entity>)` — return the full entity (or `[]` / `{}` for list/delete). No envelope, no `success: true`.
- **Validation error**: `400` with `{ code: "dtoInIsNotValid", message | note: "dtoIn is not valid", validationError: ajv.errors }`.
- **Not found**: `404` with `{ code, message }`.
- **Authorization / business rule**: `400` with `{ code, message }` (note: existing code uses 400 here, not 403 — keep it consistent).
- **Server error**: `500` with `{ message: e.message }` from the `try/catch`.

---

## CORS / security

`app.use(cors())` is wide-open — no origin allowlist. This is intentional for the local dev setup (client on `:3000` hitting server on `:8000`). Do not add an allowlist without coordinating with the client. There is **no authentication middleware** — the acting user is passed in the URL (`:userId`). Do not introduce JWT, sessions, or auth headers as a side quest.

---

## Adding a new endpoint

1. Create `src/abl/<domain>/<verb>Abl.js` following the [ABL template](#abl-file-template).
2. Add any new helper logic to `hellpers/<domain>Functions.js`. Do not extract single-use helpers.
3. Wire the route in `src/controller/<domain>.js`.
4. If the action has an assignee/creator notification, add a template + extend `sendMail.js`.
5. If the route mutates state and needs auth, copy the existing inline check (`createdBy === userId` for projects, `userOnTask(userId, projectId)` for tasks).
6. Match the URL param naming used elsewhere (`:projectId`, `:taskId`, `:userId`, `:assigneeId`) — the client builds URLs positionally.
