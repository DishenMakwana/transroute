# Runtime — Context Loader

## Purpose
Selectively injects only the relevant memory files and code symbols into the agent's context based on graph traversal, preventing context token bloat.

## Rules
- Load only files directly connected to the affected graph nodes.
- Never inject full directory trees.
