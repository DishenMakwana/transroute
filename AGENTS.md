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

<!-- code-review-graph MCP tools -->
## MCP Tools: code-review-graph

**IMPORTANT: This project has a knowledge graph. ALWAYS use the
code-review-graph MCP tools BEFORE using Grep/Glob/Read to explore
the codebase.** The graph is faster, cheaper (fewer tokens), and gives
you structural context (callers, dependents, test coverage) that file
scanning cannot.

### When to use graph tools FIRST

- **Exploring code**: `semantic_search_nodes` or `query_graph` instead of Grep
- **Understanding impact**: `get_impact_radius` instead of manually tracing imports
- **Code review**: `detect_changes` + `get_review_context` instead of reading entire files
- **Finding relationships**: `query_graph` with callers_of/callees_of/imports_of/tests_for
- **Architecture questions**: `get_architecture_overview` + `list_communities`

Fall back to Grep/Glob/Read **only** when the graph doesn't cover what you need.

### Key Tools

| Tool | Use when |
|------|----------|
| `detect_changes` | Reviewing code changes — gives risk-scored analysis |
| `get_review_context` | Need source snippets for review — token-efficient |
| `get_impact_radius` | Understanding blast radius of a change |
| `get_affected_flows` | Finding which execution paths are impacted |
| `query_graph` | Tracing callers, callees, imports, tests, dependencies |
| `semantic_search_nodes` | Finding functions/classes by name or keyword |
| `get_architecture_overview` | Understanding high-level codebase structure |
| `refactor_tool` | Planning renames, finding dead code |

### Workflow

1. The graph auto-updates on file changes (via hooks).
2. Use `detect_changes` for code review.
3. Use `get_affected_flows` to understand impact.
4. Use `query_graph` pattern="tests_for" to check coverage.
