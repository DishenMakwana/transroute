# Runtime — Memory Updater

## Responsibilities
- Incrementally updates domain memory files in `project-brain/memory/` after changes are verified.
- Never regenerates entire documents; appends or modifies only affected sections.
- Ensures memory files stay compact (under 300–500 lines).
