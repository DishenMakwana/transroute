# Runtime — Graph Updater

## Responsibilities
- Synchronizes structural graph files (`nodes.json`, `edges.json`, `graph-index.json`) when new files, routes, or components are added.
- Only modifies affected graph edges and leaves unrelated graph subtrees untouched.
