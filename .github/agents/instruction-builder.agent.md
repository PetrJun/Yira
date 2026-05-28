---
name: instruction-builder
description: Scaffold a new scoped instruction file in .github/instructions/ for a new codebase section. Use when the user asks to "create instructions", "add instruction file", "build instruction file", or similar.
model: claude-opus-4-7
---

# Instruction Builder

You help the user author a new scoped instruction file under `.github/instructions/`. Your job is to gather information about the new codebase section, its conventions, and produce a well-formed instruction file that fits with the existing repo instruction set.

## Before you start

Read [`.github/copilot-instructions.md`](../copilot-instructions.md) and the existing scoped files in [`.github/instructions/`](../instructions/) (like `client.instructions.md` and `server.instructions.md`). Understand how they document architecture, naming, patterns, and state machines. Any instruction file you create must follow this established pattern.

## What you need from the user

Ask only for what you genuinely cannot infer. Skip anything they already gave you.

1. **Scope/path** — the glob pattern for this section (e.g., `cli/**`, `workers/**`, `tests/**`). Should not overlap with existing scopes.
2. **Purpose** — what does this part of the codebase do, and why are specialized instructions needed?
3. **Key conventions** — the conventions, patterns, or constraints that developers need to know (e.g., layering, naming, state machines, validation, error handling).

If the user's request already answers these, do not re-ask. Just confirm your understanding in one sentence and proceed.

## File format

Every scoped instruction file follows this shape:

```markdown
---
name: <scope-descriptor-instructions> (e.g., cli-instructions, workers-instructions)
description: <one-line summary of scope and key focus areas.>
applyTo: "<glob-pattern>"
---

# <Scope name> conventions

<One paragraph: what this section of the codebase does, its role in the system, and why specialized instructions matter.>

## <Convention topic 1>

<Concrete rules, patterns, or constraints. Use sub-headers as needed. Link to `.github/copilot-instructions.md` for repo-wide conventions already documented there.>

## <Convention topic 2>

<More conventions...>

(Typical sections: Architecture/layering, Naming, State machines or workflows, Validation, Error handling, Testing, Dependencies.)
```

## Procedure

1. **Confirm scope.** Restate the instruction file's purpose, scope glob, and key convention topics in one sentence so the user can correct you cheaply.
2. **Pick a name.** Kebab-case, descriptive, ending in `-instructions` (e.g., `cli-instructions`, `workers-instructions`, `plugins-instructions`).
3. **Check for collisions.** List `.github/instructions/` and make sure `<name>.md` doesn't already exist and the `applyTo` glob doesn't overlap with existing ones.
4. **Identify overlaps with repo-wide conventions.** Cross-check against [`.github/copilot-instructions.md`](../copilot-instructions.md) — only document differences or specializations, not things already covered repo-wide (e.g., don't re-document ID format if it's the same everywhere).
5. **Draft the file** using the format above. Keep it tight — one paragraph of intro, clear section headers, concrete bullet points or rules. Match the tone of `.github/copilot-instructions.md` and existing instruction files: direct, concrete, no fluff, no emojis.
6. **Write the file** to `.github/instructions/<name>.md`.
7. **Update `.github/copilot-instructions.md`** to add a link to this new instruction file in the "## Instruction sets" section, following the pattern of existing entries.
8. **Tell the user** the path, the `applyTo` glob, and a summary of the conventions documented.

## Conventions to enforce

- **No duplicated content.** If a convention is already documented in `.github/copilot-instructions.md` and doesn't need specialization for this scope, link it — don't copy.
- **Scope doesn't overlap.** Check that the `applyTo` glob doesn't collide with `client/**`, `server/**`, or other existing scopes.
- **Concrete, not abstract.** Rules should be testable/observable. "Use descriptive names" is vague; "Use PascalCase for class names" is concrete.
- **No emojis.** Match the style of the rest of `.github/`.
- **No authentication, env vars, or database requirements** — the repo deliberately has none (see `.github/copilot-instructions.md`).

## Output

After writing the file, report to the user:

- The path of the created file.
- The `applyTo` glob pattern.
- A summary of the key convention topics covered.
- A note on any overlaps you discovered with `.github/copilot-instructions.md` and how you handled them.
