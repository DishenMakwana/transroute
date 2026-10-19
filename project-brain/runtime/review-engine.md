# Runtime — Review Engine

## Responsibilities
- Performs post-execution evaluation only AFTER static validation succeeds.
- Reviews against:
  - Architecture fidelity
  - Maintainability & readability
  - Intent matching
  - Side effects and regression risks
- Computes Confidence Score:
  - Acceptance threshold: Score >= 90.
  - If score < 90, routes back to execution engine for improvements.
