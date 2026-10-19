# Workflow Specification — Execution Lifecycle

## Deterministic Execution Pipeline
Every user prompt must follow the sequential lifecycle:

```mermaid
flowchart TD
    Prompt[1. Receive Prompt] --> Context[2. Retrieve Context via Graph]
    Context --> Plan[3. Planning & Verification Strategy]
    Plan --> Exec[4. Execution Engine]
    Exec --> Validate[5. Static Validation: format, lint, knip, build]
    Validate --> Review[6. AI Review & Confidence Scoring >=90]
    Review --> Sync[7. Incremental Knowledge Synchronization]
```

## Constraints
- No stage may be skipped.
- If static validation fails, execution returns directly to the coding phase without AI review.
- No implementation logic exists inside this file.
