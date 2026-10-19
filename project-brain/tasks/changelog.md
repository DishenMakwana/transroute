# Tasks — Changelog

## [2026-10-19]
- **Project Brain v2 Runtime**: Initialized complete 9-layer runtime architecture (`system/`, `memory/`, `graph/`, `runtime/`, `standards/`, `reviews/`, `tasks/`, `cache/`, `templates/`) and root `AGENTS.md`.
- **Tooling Suite**: Installed `eslint@9`, `eslint-config-next@16.4.2`, `prettier@3.9.10`, `knip@5`.
- **Verification Pipeline**: Added `format`, `lint`, `knip`, and `build` pipeline scripts. Verified 100% pass across all 4 gates with 0 errors, 0 warnings, and 0 dead code.
- **Helper Centralization**: Created `src/helpers/formatters.ts` for domain math, currency, IST hours, and PIN formatting.
- **PIN Code Search**: Enhanced search engine with postal PIN code lookup.
- **Interactive Pill Filters**: Revamped `FilterModal.tsx` to direct pill buttons.
- **Header Refinement**: Streamlined header navigation.
- **Production Readiness, SEO/AEO & Icons**: Added multi-device icon suite (`icon.svg`, `favicon.ico`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`, `og-image.png`), `llms.txt`, `llms-full.txt`, dynamic `sitemap.xml`, `robots.txt`, Web App Manifest, JSON-LD schemas (`WebSite`, `Organization`, `FAQPage`, `LogisticsService`), HTTP security headers, Docker containerization, health check endpoint, and error boundaries.
- **Universal Logo Unification**: Converted the user's uploaded cargo truck squircle emblem into vector SVGs (`logo.svg`, `icon.svg`), high-res master PNGs, multi-resolution `favicon.ico`, Apple touch icon, and OpenGraph preview; integrated the official logo into Header branding, 404 page, and carrier fallback.
- **Transport List Pagination**: Added responsive pagination bar below the transport cards feed with record range counter, page size selectors (`10`, `20`, `50`), navigation buttons, and auto-reset on filter changes.
