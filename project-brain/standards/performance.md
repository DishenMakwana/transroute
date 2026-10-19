# Standards — Performance

## Rules
- **Zero Sequential Awaits**: Parallelize independent async requests using `Promise.all([ ... ])`.
- **In-Memory Caching**: Employ TTL caches for heavy analytics and frequent corridor searches.
- **Rendering Optimization**: Avoid expensive re-renders in feeds using key hashing and compact DOM nodes.
- **Bundle Optimization**: Use direct icon imports from `lucide-react` without barrel conflicts.
