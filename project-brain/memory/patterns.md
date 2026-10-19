# Memory — Architectural & Coding Patterns

## 1. Centralized Domain Types
- All interfaces reside under `src/types/` categorized by domain (`transport.ts`, `location.ts`, `pricing.ts`, `search.ts`, `analytics.ts`, `ui.ts`).
- No local interfaces inside `.tsx` components.

## 2. Centralized Helpers
- Formatters, date math, and IST calculations reside in `src/helpers/`.

## 3. Parallel Query Execution
- Always use `Promise.all([ ... ])` for independent async queries.
- Zero sequential query waterfalls.

## 4. UI Stacking & Modals
- High-priority modals and popups use `fixed inset-0 z-50` with backdrop blur to cleanly float above all cards.
- Dropdown menus use `z-50` with proper relative containers.

## 5. Lucide React Over Emojis
- Never use raw text emojis for system icons (e.g., 🗺️, 🏢, ⚡).
- Always use `lucide-react` icons (e.g. `MapIcon`, `Building2`, `Zap`).
- Avoid identifier collisions (e.g. `import { Map as MapIcon } from "lucide-react"`).
