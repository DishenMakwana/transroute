# Planner Specification

## Purpose
The Planner analyzes requests, decomposes goals, and establishes strict pre-execution contracts.

## Responsibilities
- **Prompt Decomposition**: Break compound user goals into atomic, testable steps.
- **Complexity Estimation**: T-shirt size task complexity (Low, Medium, High).
- **Risk Assessment**: Identify regression zones, breaking changes, and state mutations.
- **Task Classification**: Label task domain (Frontend, Backend, Database, Infrastructure, Refactor).
- **Review Requirements**: Define acceptance criteria and automated verification steps.
- **Rollback Strategy**: Provide explicit steps to revert changes if verification fails.
