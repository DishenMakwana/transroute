# Memory — Routing Architecture

## Pages
- `/` (`src/app/page.tsx`): Main transport directory search page, compact results toolbar, filter modal, and route exploration banner.
- `/transports/[id]` (`src/app/transports/[id]/page.tsx`): Individual transporter profile with full godown network details, edit and delete actions.
- `/analytics` (`src/app/analytics/page.tsx`): Dedicated logistics intelligence dashboard with macro KPI cards, carrier rate spreads, and state network depth charts.

## APIs
- `GET /api/transports`: Query transports with source, destination, and filter parameters.
- `POST /api/transports`: Create a new transporter operator.
- `GET /api/transports/[id]`: Lookup single transporter details.
- `PUT /api/transports/[id]`: Update transporter record.
- `DELETE /api/transports/[id]`: Remove transporter and associated facilities/tariffs.
- `GET /api/analytics`: Aggregate national tariff distributions, state volumes, and hub ratios.
- `GET /api/export`: Stream `.xlsx` Excel rate card directory.
- `GET /api/health`: Automated health check returning uptime, environment, and storage connectivity status.

## SEO, AEO & Discovery Routes
- `/robots.txt` (`src/app/robots.ts`): Crawler permissions for search engines and AI engines (GPTBot, Claude-Web, PerplexityBot).
- `/sitemap.xml` (`src/app/sitemap.ts`): Dynamic XML sitemap indexing `/`, `/analytics`, and `/transports/[id]` profile pages.
- `/manifest.webmanifest` (`src/app/manifest.ts`): Web App Manifest defining standalone PWA capabilities and icons.
- `/llms.txt` (`public/llms.txt`): Emerging standard for LLM and AI agent directory discovery.
- `/llms-full.txt` (`public/llms-full.txt`): Comprehensive technical knowledge base and corridor specifications for LLM RAG pipelines.
