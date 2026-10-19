# Standards — React

## Rules
- **Component Cleanliness**: Keep components modular; break complex views into sub-components.
- **Hooks Hygiene**: Wrap memoized objects and callbacks with `useMemo` and `useCallback` when passed as props or dependencies.
- **Controlled Inputs**: Use controlled forms with clear validation states.
- **Accessibility**: Provide `aria-label`, `role`, and keyboard listeners (`onKeyDown`) for all custom interactive controls (e.g. dropdowns, modals).
