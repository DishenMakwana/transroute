# Standards — Next.js

## Rules
- **App Router Conventions**: Follow Next.js App Router structure (`page.tsx`, `layout.tsx`, `route.ts`).
- **Client vs Server Components**: Mark interactive components with `"use client"` at the very top.
- **Dynamic Route Flags**: Use `export const dynamic = "force-dynamic";` when route handlers parse request search parameters.
- **Link Components**: Always use `next/link` for internal navigation.
