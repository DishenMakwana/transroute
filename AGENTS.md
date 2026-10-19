# AGENTS.md — Deterministic Engineering Runtime Guidelines

## 1. Vision & Core Principles (Project Brain v2)
Project Brain is an AI-native engineering runtime that eliminates repeated codebase analysis through persistent architectural memory, graph-based retrieval, and deterministic workflows.

- **Selective Context Retrieval**: Never analyze the entire codebase unless explicitly requested. Retrieve only required modules.
- **Deterministic Pipeline**: Every request executes in strict order:
  `Prompt -> Classify -> Graph Retrieval -> Context Load -> Plan -> Execute -> Static Validation -> AI Review -> Confidence Scoring (>=90) -> Knowledge Sync`.
- **Modular Memory**: Memory is partitioned by domain (`overview`, `architecture`, `frontend`, `backend`, `database`, `routing`, `api`, `dependencies`, `patterns`), each under 300–500 lines.
- **Incremental Synchronization**: Never regenerate documentation from scratch. Only update affected nodes and markdown files upon accepted changes.

---

## 2. Code Quality & Typing Standards
- **Zero Local Component Interfaces**: Centralize all domain interfaces and models in `src/types/` organized by domain (`transport.ts`, `location.ts`, `pricing.ts`, `search.ts`, `analytics.ts`, `ui.ts`).
- **Domain Helpers**: Place all math, currency, date, and string formatting helpers in `src/helpers/`.
- **Strict TypeScript**: Avoid `any`. Preserve full generic contracts.

---

## 3. Database & Concurrency Guidelines
- **Drizzle ORM & Postgres**: Schemas are declared in `src/db/schema.ts`.
- **Zero Sequential Awaits**: Eliminate sequential awaits for independent operations. Always parallelize using `Promise.all([ ... ])` for database queries, analytics aggregation, and async I/O.
- **Defensive Error Handling**: Always catch and gracefully handle database connection limits and edge cases.

---

## 4. Mandatory Post-Code Verification Pipeline
After writing or editing code in this repository, you MUST execute the following 4 verification steps in order:
1. `bun run format` — Prettier formatting validation.
2. `bun run lint` — ESLint flat config validation (0 errors, 0 warnings).
3. `bun run knip` — Dead code, unused exports, and orphan dependency verification.
4. `bun run build` — Clean Next.js Turbopack build and TypeScript validation.

Do not consider any task complete until all 4 verification commands pass cleanly.
