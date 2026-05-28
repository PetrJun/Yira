---
applyTo: "client/**"
---

# Client — Instruction Set

## Stack

| Layer | Library |
|---|---|
| Framework | React 18 (Create React App / `react-scripts`) |
| Routing | React Router DOM v6 |
| UI components | React Bootstrap v2 + Bootstrap v5 |
| Data grid | MUI X DataGrid Pro (`@mui/x-data-grid-pro`) |
| Icons | `@mdi/react` + `@mdi/js` (Material Design Icons) |
| Date formatting | `date-fns` |
| State | React Context API — no Redux, no Zustand |

---

## Architecture

### Context + Provider pattern

Every domain has two files:

- `*Context.js` — calls `createContext()` and exports the context object. No logic.
- `*Provider.js` — owns state and all API calls; exposes values via the context.

Three domains: **User**, **Project**, **Task**.

**Provider state shape** (always the same):
```js
{ state: "ready" | "pending" | "error", data: ..., error: ... }
```

**Exposed via context** (always the same naming):
```js
{
  state,                   // "ready" | "pending" | "error"
  <domain>,                // the data (e.g. project, task)
  handlerMap<Domain>,      // object with CRUD handlers (handleCreate, handleUpdate, handleDelete, handleUpdateAssigneeUser)
}
```

Always consume context with `useContext`, never with a custom hook wrapper.

### Provider nesting order in `App.js`

```
UserProvider
  ProjectProvider
    TaskProvider
      BrowserRouter / Routes
```

User data is loaded once on mount inside `UserProvider`. Login/logout are done client-side only — `setLoggedInUser` stores just the user ID; the full user object is derived from the user list.

---

## Routing

| Path | Component |
|---|---|
| `/` | `Dashboard` |
| `/project?id=<id>` | `ProjectDetail` |
| `/task?id=<id>` | `TaskDetail` |
| `*` | "not found" string |

All routes are nested under the `Layout` route which renders `NavBar` + `<Outlet>` + footer.

Read the ID from the URL with:
```js
const id = new URLSearchParams(useLocation().search).get("id");
```

---

## API

Base URL: `http://localhost:8000/api/`

Endpoints used by the client:

| Method | Path | Purpose |
|---|---|---|
| GET | `/user/list` | Fetch all users |
| GET | `/project/get/:projectId` | Fetch single project |
| GET | `/project/getTasksAndProjectsOnUser/:userId` | Dashboard + detail data |
| POST | `/project/create` | Create project |
| PUT | `/project/update/:projectId/:userId` | Edit project |
| DELETE | `/project/delete/:projectId/:userId` | Delete project |
| PATCH | `/project/updateAssigneeUser/:projectId/:assigneeUserId/:userId` | Reassign project |
| GET | `/task/get/:taskId` | Fetch single task |
| POST | `/task/create` | Create task |
| PUT | `/task/update/:taskId/:userId` | Edit task |
| DELETE | `/task/delete/:taskId/:userId` | Delete task |
| PATCH | `/task/updateAssigneeUser/:taskId/:assigneeUserId/:userId` | Reassign task |

All API calls live inside Provider files. Components never call `fetch` directly except when loading detail/dashboard data in `useEffect` hooks inside page components.

---

## Component conventions

### File structure

Each file exports one default component. Shared helpers or style functions live at the bottom of the same file — do not extract to separate utility files unless reused across multiple components.

### Styling

Inline styles via plain objects returned from named functions placed at the bottom of the file:

```js
function componentStyle() {
  return { backgroundColor: "blue" };
}
// Used as: <Navbar style={componentStyle()}>
```

Do not use CSS files, CSS modules, or styled-components. The global background color is `#B9D9EB` (set on the root `div` in `App.js`).

### Icons

Always import from `@mdi/js` and render with `@mdi/react`:

```js
import Icon from "@mdi/react";
import { mdiPlusBoxOutline } from "@mdi/js";

<Icon path={mdiPlusBoxOutline} size={1} color="white" />
```

### Forms

Forms are always rendered as React Bootstrap `<Modal>` components. The Modal is conditionally rendered with `!!showXxxForm`. The form receives the existing object (or `{}` for create) and a setter to close itself:

```js
// show
setShowTaskForm({})        // create (empty object = truthy)
setShowTaskForm(taskInfo)  // edit (existing data object)

// close
setShowTaskForm(false)

// conditional render
{!!showTaskForm && <TaskForm task={showTaskForm} setShowTaskForm={setShowTaskForm} />}
```

Inside the form component, detect create vs. edit with `task.id` / `project.id`.

### Delete dialogs

Separate confirm-dialog components: `ConfirmDeleteDialogTask`, `ConfirmDeleteDialogProject`. Same show/hide pattern as forms.

---

## Roles and permissions

| Role | Can create projects | Can edit/delete own projects | Can reassign tasks |
|---|---|---|---|
| `projectManager` | Yes | Yes (if `createdBy === loggedInUser.id`) | Yes (if assignee or creator) |
| (any other) | No | — | Yes (if assignee or creator) |

Guard project creation UI with:
```js
if (loggedInUser?.role === "projectManager") { setCanCreateProject(true); }
```

Edit/Delete buttons are only shown to `createdBy === loggedInUser.id`.

---

## Task states

Valid values: `TODO`, `INPROGRESS`, `DONE`, `CANCELLED`, `REVIEW`

Dashboard color coding:
- `DONE` → `lightgreen`
- `INPROGRESS` → `lightblue`
- `TODO` → `lightyellow`
- `CANCELLED` → `#FF5733`
- `REVIEW` → `lightgray`

---

## Data refresh pattern

Components do NOT subscribe to provider state for list data. Instead they refetch in `useEffect` and use a boolean flag to trigger a re-fetch after a mutation:

```js
const [assigneeUserChanged, setAssigneeUserChanged] = useState(false);

useEffect(() => {
  // fetch data
  setAssigneeUserChanged(false);
}, [loggedInUser, assigneeUserChanged, showTaskForm]);

const handleUpdate = async (...) => {
  await handlerMapTask.handleUpdateAssigneeUser(...);
  setAssigneeUserChanged(true);   // triggers refetch
};
```

The `showXxxForm` state is also included in `useEffect` deps so data refreshes after a form closes.

---

## Dashboard specifics

- Uses `DataGridPro` with `treeData` — projects are parents, tasks are children.
- Hierarchy is built from the `getTasksAndProjectsOnUser` endpoint: items with `projectId` get `hierarchy: [projectName, taskName]`; projects get `hierarchy: [projectName]`.
- Duplicate names in the hierarchy are disambiguated with a counter suffix `(2)`, `(3)`, etc. via `modifyHierarchy()`.
- Keyboard shortcuts (double-tap within 2 seconds):
  - **Shift × 2** → open TaskForm
  - **Ctrl × 2** → open ProjectForm (projectManagers only)

---

## NavBar / login

Login is simulated: the NavBar dropdown lists all users; clicking one calls `handlerMap.login(user.id)`. There is no real authentication. The logged-in user ID is stored in `UserProvider` state; the full object is derived on read.

---

## Adding a new page

1. Create `src/MyPage.js` as a functional component.
2. Add the route in `App.js` under the `Layout` route.
3. If the page needs data mutations, consume the relevant context with `useContext`.
4. Read URL params with `useLocation` + `URLSearchParams`.
5. Guard the render with `loggedInUser?.id` and show the `messageStyle` div if not logged in.
