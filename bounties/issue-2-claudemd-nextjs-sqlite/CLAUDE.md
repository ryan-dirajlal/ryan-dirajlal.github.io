# CLAUDE.md — Next.js 15 + SQLite SaaS

## Stack

| Layer | Package | Version |
|---|---|---|
| Framework | Next.js App Router | 15.x |
| Database | better-sqlite3 | 9.x |
| ORM / migrations | drizzle-orm + drizzle-kit | 0.30.x |
| Auth | Auth.js (next-auth v5) | 5.x |
| Styles | Tailwind CSS | 3.x |
| Runtime | Node.js | 20 LTS |

---

## Folder structure

```
app/
  (auth)/           # Auth routes — login, register, logout
  (dashboard)/      # Authenticated routes — each segment is a feature
  api/              # Route handlers only; no UI
lib/
  db.ts             # Single better-sqlite3 instance (singleton)
  auth.ts           # Auth.js config
  schema.ts         # Drizzle table definitions (source of truth)
migrations/         # Generated SQL files — never edit by hand
components/
  ui/               # Primitive components (Button, Input, Card…)
  features/         # Composite components tied to a domain
```

**Rules:**
- Every page is a Server Component by default. Add `"use client"` only when you need browser APIs or event handlers.
- Route handlers live in `app/api/`. Never put business logic inside them — delegate to `lib/`.
- Never import `lib/db.ts` inside a component. Go through a `lib/actions/` server action or a Route Handler.

---

## Database conventions

### Singleton connection

```ts
// lib/db.ts
import Database from "better-sqlite3";
import path from "path";

const DB_PATH = process.env.DB_PATH ?? path.join(process.cwd(), "data", "app.db");

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

export default db;
```

Always import from `lib/db.ts`. Never call `new Database()` anywhere else.

### Schema definition

All tables are defined in `lib/schema.ts` using Drizzle ORM:

```ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});
```

**Rules:**
- All IDs are `text` UUIDs, not autoincrement integers — easier to distribute later.
- All timestamps are `integer` in Unix epoch seconds. Use `{ mode: "timestamp" }` so Drizzle returns `Date` objects.
- `createdAt` and `updatedAt` are required on every table.
- No nullable columns unless the absence of data is semantically meaningful.

### Migrations

Generate and run migrations with:

```bash
npx drizzle-kit generate   # creates a new .sql file in migrations/
npx drizzle-kit migrate    # applies pending migrations
```

**Never edit generated migration files.** To fix a schema mistake, generate a new migration.

---

## Dev commands

```bash
npm run dev          # start Next.js dev server (port 3000)
npm run build        # production build
npm run lint         # ESLint
npx drizzle-kit studio   # visual DB browser at localhost:4983
```

---

## Component patterns

### Server Components (default)

```tsx
// app/(dashboard)/settings/page.tsx
import { getUserById } from "@/lib/actions/users";

export default async function SettingsPage() {
  const user = await getUserById(); // direct DB call is fine here
  return <SettingsForm user={user} />;
}
```

### Client Components

```tsx
"use client";
// components/features/SettingsForm.tsx
import { updateUser } from "@/lib/actions/users";

export function SettingsForm({ user }: { user: User }) {
  return (
    <form action={updateUser}>
      {/* … */}
    </form>
  );
}
```

Use Server Actions (`"use server"` functions in `lib/actions/`) for all mutations. Never use client-side `fetch` to call your own API routes for mutations.

---

## Prohibited practices

| Do NOT | Why |
|---|---|
| `import db from "@/lib/db"` inside a component | Leaks DB connection to client bundle |
| Multiple `new Database()` calls | SQLite has one writer; multiple connections cause SQLITE_BUSY under load |
| `db.exec(userInput)` | SQL injection |
| Storing passwords in plain text | Use `bcryptjs` or Auth.js built-in hashing |
| `any` type annotations | Hides bugs; use `unknown` + type guards |
| Synchronous `fs` calls in route handlers | Blocks the event loop; use `fs/promises` |
| Editing generated migration `.sql` files | Breaks migration history; generate a new migration instead |
| `export const dynamic = "force-dynamic"` everywhere | Disables static optimisation; only add it when you have a good reason |
| Putting secrets in `.env.local` without adding them to `.env.example` | New developers won't know what env vars are required |

---

## Auth pattern (Auth.js v5)

```ts
// lib/auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import db from "./db";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      async authorize({ email, password }) {
        const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
        if (!user || !await bcrypt.compare(password, user.password_hash)) return null;
        return { id: user.id, email: user.email };
      },
    }),
  ],
  session: { strategy: "jwt" },
});
```

Add `export { handlers as GET, handlers as POST }` in `app/api/auth/[...nextauth]/route.ts`.

Protect routes by calling `auth()` in the layout or page — never in middleware unless you need edge-compatible auth.

---

## Environment variables

Required variables — copy `.env.example` and fill in:

```
AUTH_SECRET=         # 32+ random bytes: openssl rand -base64 32
DB_PATH=             # absolute path to .db file, e.g. /data/app.db
NODE_ENV=development
```

---

## Testing this CLAUDE.md

1. Scaffold a fresh project: `npx create-next-app@latest myapp --typescript --tailwind --app`
2. Drop this file in the root as `CLAUDE.md`
3. Open Claude Code and ask: "What database does this project use and how do I add a new table?" — Claude should answer correctly from context alone without searching the web.
