# 🚛 Transport Box Dispatch (Indian Freight & Logistics Directory)

[![Next.js 16](https://img.shields.io/badge/Next.js-16.4.2-black?logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.0.0-blue?logo=react)](https://react.dev/)
[![Bun Runtime](https://img.shields.io/badge/Runtime-Bun-f472b6?logo=bun)](https://bun.sh/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?logo=postgresql)](https://www.postgresql.org/)
[![Drizzle ORM](https://img.shields.io/badge/ORM-Drizzle-C5F74F?logo=drizzle)](https://orm.drizzle.team/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-CSS_v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![TypeScript Strict](https://img.shields.io/badge/TypeScript-Strict_5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Verification Pipeline](https://img.shields.io/badge/Pipeline-Format%20%7C%20Lint%20%7C%20Knip%20%7C%20Build-emerald)](https://github.com/)

An AI-native, high-performance B2B Indian road freight directory and tariff intelligence platform. Search road transport operators across multi-state trade corridors, compare per-kg and per-box freight rates, inspect branch godown networks, visualize macro freight analytics, and export standardized rate sheets.

---

## 🌟 Key Features

- **⚡ Corridor & Pincode Discovery**: Search carriers by origin and destination with real-time autocompletion across Indian cities, districts, states, and 6-digit postal PIN codes (e.g., Surat `395002` to Mumbai `400001`).
- **🔍 Multi-Dimensional Faceted Filtering**:
  - Operating hours ("Open Now" badge & realtime filter)
  - Tariff price bounds (minimum & maximum ₹)
  - Facility types (`Godown`, `Booking Office`, `Pickup & Drop-off Point`)
  - Weight units (`Per Kg`, `Per Ton`, `Per Quintal`)
  - Box sizes (`Small`, `Medium`, `Large`, `Extra Large`)
  - Tariff sorting (Lowest Price, Highest Price, Fast Delivery, Rating)
- **🔗 100% Shareable URL State**: Two-way synchronization between URL search parameters and UI state. Filter combinations, search queries, and windowed pagination (`?page=2&pageSize=20`) are instantly shareable, bookmarkable, and history-friendly (`popstate` back/forward).
- **📄 Responsive Windowed Pagination**: Dynamic carrier pagination supporting `10`, `20`, and `50` records per page with windowed page selection and record counters.
- **📊 Freight Analytics & Macro Intelligence**: Interactive charts powered by Recharts:
  - Tariff spread distributions (per kg vs. box categories)
  - Multi-state godown network depth
  - Facility composition ratios (godowns vs. booking hubs)
  - National corridor rate benchmarks
- **📥 Excel Rate Sheet Export**: 1-click generation of structured `.xlsx` rate sheets with auto-fitted column widths, currency formats, and contact directories.
- **✨ Transport Management Modal**: Add and edit road carriers, tariff structures, branch facilities, and GST credentials in real time.
- **🤖 SEO, AEO & LLM Readiness**:
  - Full machine-readable route manifests via `/llms.txt` and `/llms-full.txt`
  - JSON-LD structured schema (`LogisticsService`, `WebSite`)
  - OpenGraph & Twitter Cards
  - Automated `robots.txt` and `sitemap.xml`
- **🎨 Unified Icon Suite**: High-resolution vector and raster icons (SVG, PNG 16/32/48/180/192/512) and Web App Manifest (`site.webmanifest`).

---

## 🛠️ Tech Stack & Architecture

| Layer | Technologies |
| :--- | :--- |
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org/) + [React 19](https://react.dev/) |
| **Runtime & Bundler** | [Bun](https://bun.sh/) + Next.js Webpack / Turbopack |
| **Language** | [TypeScript 5.7 (Strict)](https://www.typescriptlang.org/) |
| **Database & ORM** | [PostgreSQL](https://www.postgresql.org/) + [Drizzle ORM](https://orm.drizzle.team/) |
| **Styling & UI** | [Tailwind CSS v4](https://tailwindcss.com/), [Lucide React](https://lucide.dev/), [Geist Font](https://vercel.com/font) |
| **Charts & Data** | [Recharts](https://recharts.org/), [SheetJS (xlsx)](https://docs.sheetjs.com/) |
| **Feedback & Polish** | [React Hot Toast](https://react-hot-toast.com/) |
| **Code Quality** | [ESLint 9 (Flat Config)](https://eslint.org/), [Prettier 3](https://prettier.io/), [Knip 5](https://knip.dev/) |

### Project Brain v2 Architecture Principles
1. **Zero Local Component Interfaces**: All domain types and component prop contracts are centralized under `src/types/` (`transport.ts`, `location.ts`, `pricing.ts`, `search.ts`, `analytics.ts`, `ui.ts`).
2. **Dedicated Domain Helpers**: String formatting, currency parsing, date utilities, and math logic live exclusively in `src/helpers/`.
3. **Zero Sequential Awaits**: Independent database queries, analytics summaries, and asynchronous operations run concurrently via `Promise.all([ ... ])`.

---

## 🚀 Getting Started (Local Development)

### 1. Prerequisites
- [Bun](https://bun.sh/) (v1.1+ recommended)
  ```bash
  curl -fsSL https://bun.sh/install | bash
  ```
- [PostgreSQL](https://www.postgresql.org/) database running locally or hosted on [Neon](https://neon.tech/) / Supabase / AWS RDS.

### 2. Clone and Install
```bash
git clone https://github.com/your-username/transport-box-dispatch.git
cd transport-box-dispatch
bun install
```

### 3. Configure Environment Variables
Create a `.env.local` or `.env` file in the root directory:

```env
# PostgreSQL Connection URL
DATABASE_URL="postgres://username:password@localhost:5432/transport_db"

# Optional: Next.js Public URL (defaults to http://localhost:3000)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Database Setup & Seeding
Push the Drizzle ORM schema to your database and load realistic Indian freight sample data:

```bash
# Push schema definitions to Postgres
bun run db:push

# Seed Indian transport operators, corridors, facilities, and tariff cards
bun run db:seed
```

### 5. Launch the Development Server
```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 🛡️ Mandatory Post-Code Verification Pipeline

Every code modification must pass our deterministic 4-step quality assurance pipeline in strict sequence:

```bash
# 1. Format code with Prettier
bun run format

# 2. Lint code with ESLint 9 Flat Config (0 errors, 0 warnings)
bun run lint

# 3. Detect dead code, orphan exports, and unused dependencies
bun run knip

# 4. Compile application and validate strict TypeScript types
bun run build
```

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description | Query Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/transports` | Query carriers with route, price, and facility filters | `source`, `destination`, `openNow`, `minPrice`, `maxPrice`, `locationType`, `weightUnit`, `boxSizeUnit`, `sortBy` |
| `POST` | `/api/transports` | Register a new transport operator | Request Body: `CreateTransportInput` |
| `PUT` | `/api/transports/:id` | Update carrier details, rates, and locations | Request Body: `CreateTransportInput` |
| `DELETE` | `/api/transports/:id` | Soft/hard delete a carrier from directory | URL parameter: `id` |
| `GET` | `/api/analytics` | Retrieve aggregated freight metrics and corridor stats | None |
| `GET` | `/api/export` | Download dynamic `.xlsx` rate sheet workbook | None |

---

## 📂 Project Structure

```
transport/
├── AGENTS.md                  # Deterministic engineering runtime instructions
├── knip.json                  # Dead-code & orphan export validator configuration
├── package.json               # Scripts, dependencies, and engine targets
├── public/                    # Static assets, branding, and crawler endpoints
│   ├── favicon.ico
│   ├── icon.svg               # Master SVG brand icon
│   ├── icon-*.png             # Scaled PWA & touch icons (16, 32, 48, 180, 192, 512)
│   ├── llms.txt               # LLM and AEO discovery manifest
│   ├── llms-full.txt          # Complete machine-readable system documentation
│   ├── robots.txt             # Search engine crawler instructions
│   └── site.webmanifest       # Web application manifest
├── project-brain/             # Architectural specifications and completed task logs
│   ├── architecture/
│   ├── standards/
│   └── tasks/
└── src/
    ├── app/                   # Next.js App Router (Layouts, Pages, API Routes)
    │   ├── api/               # Serverless API endpoints
    │   ├── analytics/         # Macro freight intelligence dashboard
    │   ├── layout.tsx         # Root layout with SEO metadata & JSON-LD
    │   ├── page.tsx           # Main corridor search & transport feed
    │   └── sitemap.ts         # Automated XML sitemap generator
    ├── components/            # Modular React 19 UI components
    │   ├── AutocompleteInput.tsx
    │   ├── FilterModal.tsx
    │   ├── Header.tsx
    │   ├── Pagination.tsx     # Windowed page navigation & page size selector
    │   ├── SearchBar.tsx
    │   ├── TransportCard.tsx
    │   ├── TransportList.tsx
    │   └── TransportModal.tsx
    ├── db/                    # Drizzle ORM schema, client connection, and seeders
    │   ├── index.ts
    │   ├── schema.ts
    │   └── seed.ts
    ├── helpers/               # Domain-specific mathematical and formatting utilities
    │   ├── analytics.ts
    │   └── formatters.ts
    └── types/                 # Centralized domain TypeScript interfaces
        ├── analytics.ts
        ├── location.ts
        ├── pricing.ts
        ├── search.ts
        ├── transport.ts
        └── ui.ts
```

---

## 🐳 Docker Deployment (Optional)

Build and run the production image using Docker:

```dockerfile
# Build image
docker build -t transport-directory .

# Run container
docker run -p 3000:3000 --env-file .env transport-directory
```

---

## 📄 License
This project is licensed under the MIT License.
