# CLAUDE.md template — Next.js 15 + SQLite SaaS

A production-ready `CLAUDE.md` context file for SaaS projects built with Next.js 15 App Router and SQLite via `better-sqlite3` + Drizzle ORM.

## What it covers

- Stack versions pinned
- Folder structure with rationale
- SQLite singleton pattern and WAL-mode setup
- Drizzle schema conventions (UUID PKs, epoch timestamps)
- Migration workflow — generate, never edit
- Server vs Client Component rules
- Server Actions pattern for mutations
- Prohibited practices table with explanations
- Auth.js v5 credentials setup
- Required environment variables

## Setup (3 steps)

1. Copy `CLAUDE.md` to the root of your Next.js project.
2. Replace the stack version numbers with your actual versions if different.
3. Open Claude Code in the project — it will read the file automatically.

## Validation

Tested by creating a fresh `create-next-app` project, placing this `CLAUDE.md` in the root, and asking Claude Code:

> "What database does this project use, how do I add a new table, and what's the migration command?"

Claude answered correctly from context, citing `better-sqlite3`, Drizzle ORM, and `npx drizzle-kit generate` without any web searches.
