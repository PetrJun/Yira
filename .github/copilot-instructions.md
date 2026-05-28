# Yira — Copilot Instructions

Yira is a Jira-like task tracker split into two apps in a single repo:

- **`client/`** — React 18 SPA (Create React App), React Bootstrap, MUI X DataGrid Pro. Runs on `http://localhost:3000`.
- **`server/`** — Express 4 REST API backed by JSON files on disk. Runs on `http://localhost:8000`.

There is no shared package — the client talks to the server over HTTP under `/api/`.

## Instruction sets

Detailed conventions for each side live in scoped instruction files. Follow the one whose `applyTo` glob matches the file you are editing:

- [`.github/instructions/client.instructions.md`](./instructions/client.instructions.md) — `applyTo: "client/**"`
  Stack, Context/Provider architecture, routing, API call sites, component/form/styling conventions, roles, task states, dashboard specifics.
- [`.github/instructions/server.instructions.md`](./instructions/server.instructions.md) — `applyTo: "server/**"`
  Controller → ABL → DAO layering, ajv validation schema rules, authorization checks, file-based DAOs, email side effects, error response shapes.

When a change spans both sides (e.g. adding an endpoint and consuming it), read both files and keep route paths / URL param names in sync — the client builds URLs positionally from the server's route shapes.

## Agents

Custom agents live in `.github/agents/`. Invoke them from the code editor when you need to scaffold or generate code at scale. Each agent knows the relevant instruction file(s) and enforces the repo's conventions.

- [`.github/agents/agent-builder.agent.md`](./agents/agent-builder.agent.md) — Create a new agent definition. Invoke with "create an agent" or "add an agent".
- [`.github/agents/instruction-builder.agent.md`](./agents/instruction-builder.agent.md) — Scaffold a new scoped instruction file. Invoke with "create instructions" or "add instruction file".
- [`.github/agents/skill-builder.agent.md`](./agents/skill-builder.agent.md) — Create a new skill definition. Invoke with "create a skill" or "add a skill".

## Repo-wide conventions

- **No build step on the server** — `npm start` in `server/` runs `node app.js` directly.
- **Client API base URL** is hard-coded to `http://localhost:8000/api/`. Don't introduce env-based config without coordinating both sides.
- **No authentication.** The acting user ID is passed in URL params (`:userId`). Don't add JWT/sessions as a side quest.
- **No database.** Server storage is JSON files under `server/src/DAO/storage/`. Don't introduce an ORM or DB driver.
- **IDs** are 32-char hex strings produced by `crypto.randomBytes(16).toString("hex")` on the server. Client treats them as opaque strings.
- **Task states** are shared vocabulary: `TODO | INPROGRESS | DONE | CANCELLED | REVIEW`. Defined server-side in `server/src/hellpers/enumState.js` (note the `hellpers` spelling — keep it) and color-mapped client-side in the dashboard.
- **Roles**: `projectManager` (can create projects) and `teamMember`. Project edit/delete is gated to `createdBy`; task mutations are gated to membership in `project.userList`.
