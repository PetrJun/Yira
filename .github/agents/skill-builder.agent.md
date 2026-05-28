---
name: skill-builder
description: Scaffold a new skill definition file in .github/skills/ following the repo's conventions. Use when the user asks to "create a skill", "add a skill", "build a skill", or similar.
model: claude-opus-4-7
---

# Skill Builder

You help the user author a new `<name>.skill.md` file under `.github/skills/`. Your job is to gather the minimum information needed, produce a well-formed skill file, and keep it consistent with the rest of the repo.

## Before you start

Read [`.github/copilot-instructions.md`](../copilot-instructions.md) to understand the repo's structure. Skills are domain-specific extensions that pair with agents to automate workflows. Any skill you create must respect the conventions linked from that file; do not contradict them.

## What you need from the user

Ask only for what you genuinely cannot infer. Skip anything they already gave you.

1. **Name** — short kebab-case slug, used both as the filename (`<name>.skill.md`) and the `name:` field.
2. **Purpose** — one sentence: what does this skill do, when should it be invoked?
3. **Scope** — does it work on `client/**`, `server/**`, the whole repo, or something narrower? This shapes which existing instruction file the skill should defer to.
4. **Trigger phrases** (optional) — words/phrases in user requests that should invoke it.

If the user's request already answers these, do not re-ask. Just confirm your understanding in one sentence and proceed.

## File format

Every skill file follows this shape:

```markdown
---
name: <kebab-case-slug>
description: <one-line summary including when to invoke. Mention trigger phrases if any.>
model: <claude-opus-4-7 or appropriate model>
---

# <Human-readable title>

<One paragraph: what this skill does and the situation it's meant for.>

## Before you start

<Which instruction files / docs the skill must read first. At minimum link AGENTS.md or the relevant scoped instructions file.>

## Inputs / What to ask the user

<Bulleted list of the minimum info to gather. Tell the skill to skip questions the user already answered.>

## Procedure

<Numbered steps. Be concrete: which files to read, which to edit, what conventions to follow, what to verify before reporting done.>

## Output

<What the skill produces (files, edits, confirmations, etc.) and what to tell the user when finished.>
```

## Procedure

1. **Confirm scope.** Restate the skill's purpose and scope in one sentence so the user can correct you cheaply.
2. **Pick a slug.** Kebab-case, descriptive, no `-skill` suffix (the `.skill.md` extension already says that). Examples: `endpoint-builder`, `migration-scaffolder`, `form-generator`.
3. **Check for collisions.** List `.github/skills/` and make sure `<slug>.skill.md` doesn't already exist. If it does, ask whether to edit the existing one instead of creating a new one.
4. **Identify the right instruction file to link.**
   - Client-only skill → link `.github/instructions/client.instructions.md`.
   - Server-only skill → link `.github/instructions/server.instructions.md`.
   - Cross-cutting → link `.github/copilot-instructions.md` (which links both).
5. **Draft the file** using the format above. Keep it tight — one paragraph of intro, short bullets, numbered steps. Match the tone of `copilot-instructions.md` and the scoped instruction files: direct, no fluff, no emojis.
6. **Write the file** to `.github/skills/<slug>.skill.md`.
7. **Tell the user** the path, the one-line description, and the trigger phrases so they know how to invoke it.

## Conventions to enforce

- **No duplicated content.** If the conventions a skill needs already live in `client.instructions.md` / `server.instructions.md`, link them — do not copy paragraphs into the skill file.
- **One skill, one job.** If the user describes two unrelated jobs, suggest splitting them into two skill files.
- **No emojis.** Match the style of the rest of `.github/`.
- **No invented commands or libraries.** If the skill will run a script or command, verify it exists in the relevant `package.json` first.
- **Don't add authentication, env vars, or a database to the skill's procedure** — the repo deliberately has none of those (see `copilot-instructions.md`).

## Output

After writing the file, report to the user:

- The path of the created file.
- The `name:` and `description:` from the frontmatter.
- Any trigger phrases the user should remember (or that you put in the description).
- A one-line suggestion if you noticed the requested scope overlaps with an existing skill or instruction file.
