# Standards — TypeScript

## Rules
- **No `any`**: Use explicit union types, generics, or `unknown` with type guards.
- **Centralized Types**: All interfaces and domain types must reside in `src/types/`. No local interfaces in components.
- **Strict Null Checks**: Always handle `null` and `undefined` explicitly.
- **Explicit Returns**: Provide explicit return types for shared helper functions.
