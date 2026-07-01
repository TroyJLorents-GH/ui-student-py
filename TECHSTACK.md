---
project: projects/ui-student-py
type: techstack
---

# TECHSTACK – ui-student-py (Student Hiring System Frontend)

A single-page React application (Create React App + CRACO) that serves as the
frontend for the ASU Student Hiring / SAMS system. It talks to a separate
Python FastAPI backend over a REST/JSON API. This document covers the frontend
only (the contents of this repository).

> Note: despite the `-py` suffix, this repository is a **JavaScript/React**
> frontend. The `-py` refers to the paired Python (FastAPI) backend it targets.

---

## Languages

| Language | Where | Notes |
| --- | --- | --- |
| JavaScript (ES2020+, JSX) | `src/**` | All application code. React function components with hooks. |
| CSS | `src/index.css`, `src/styles/App.css` | Global styling; most styling is done via MUI `sx` props and the theme. |
| HTML | `public/index.html` | CRA HTML shell. |
| YAML | `.github/workflows/` | CI/CD pipeline definition. |

No TypeScript is used; the project is plain JavaScript.

---

## Core Framework & Runtime

| Tech | Version | Purpose |
| --- | --- | --- |
| **React** | ^19.0.0 | UI library; the entire app is built from React function components. |
| **react-dom** | ^19.0.0 | DOM renderer for React. |
| **react-router-dom** | ^7.3.0 | Client-side routing. Routes and route guards are defined in `src/App.js` / `src/RouteGuard.js`. |
| **react-scripts (CRA)** | 5.0.1 | Create React App tooling (webpack, Babel, dev server, Jest). |
| **@craco/craco** | ^7.1.0 | Overrides CRA's webpack config without ejecting (see Build Tools). |
| **cra-template** | 1.2.0 | Base CRA project template. |

---

## UI / Component Libraries

| Library | Version | Purpose |
| --- | --- | --- |
| **@mui/material** | 7.3 | Material UI core components — the primary component system. |
| **@mui/system** | 7.3 | MUI styling engine / `sx` prop support. |
| **@mui/icons-material** | ^7.2.0 | Material icon set used throughout the UI and the chat widget. |
| **@emotion/react**, **@emotion/styled** | ^11.14.0 | CSS-in-JS engine that MUI is built on. |
| **@mui/x-data-grid**, **-pro**, **-premium** | ^8.29.0 | Editable data grids — the workhorse for dashboards, assignment tables, and bulk-upload previews (detail panels, inline editing, change highlighting). |
| **@mui/x-charts-pro**, **-premium** | ^8.29.0 | Charts used in the Admin Analytics tabs (`src/admin/analytics/`). |
| **@mui/x-date-pickers-pro** | ^8.29.0 | Date/date-range pickers for assignment and term date inputs. |
| **@mui/x-tree-view-pro** | ^8.29.0 | Tree view component (Pro). |
| **@mui/x-scheduler** | ^9.0.0-alpha.6 | Scheduler component (alpha). Pulls in `@atlaskit/pragmatic-drag-and-drop`, which requires the CRACO webpack workaround. |
| **@mui/x-license** | (via MUI X) | Registers the MUI X Pro/Premium license key (`LicenseInfo.setLicenseKey` in `src/App.js`). |
| **lucide-react** | ^0.525.0 | Supplemental icon set. |
| **ag-grid-community**, **ag-grid-react** | ^33.2.4 | Alternative data grid (AG Grid) available alongside MUI X. |
| **@mescius/wijmo.purejs.all** | ^5.20251.34 | Wijmo (Mescius) grid/UI toolkit (additional grid option). |

The app uses a custom MUI theme (`src/theme.js`) with ASU brand colors
(maroon `#8c1d40` primary, gold `#FFC627` secondary).

---

## Data, Documents & Formatting

| Library | Version | Purpose |
| --- | --- | --- |
| **xlsx** (SheetJS) | ^0.18.5 | Reading/writing Excel & CSV files for bulk upload and exports. |
| **@react-pdf/renderer** | ^4.3.0 | Generating printable PDF hiring confirmations. |
| **react-markdown** | ^10.1.0 | Renders assistant (chatbot) replies as Markdown (`ChatWidget.js`). |
| **remark-gfm** | ^4.0.1 | GitHub-Flavored Markdown support (tables, etc.) for the chat renderer. |
| **react-input-mask** | ^2.0.4 | Masked text inputs (e.g. IDs / formatted fields). |
| **d3-scale-chromatic** | ^3.1.0 | Color scales for charts/visualizations. |

---

## Networking / Backend Integration

- **fetch** (native) is the HTTP transport. A thin wrapper, `src/utils/apiClient.js`
  (`apiFetch`), centralizes the base URL, JSON headers, `credentials: "include"`,
  and 401 → login redirect handling.
- The backend base URL comes from `REACT_APP_API_URL`. In development the CRA
  `proxy` field in `package.json` (`http://localhost:8001`) proxies API calls.
- Auth state is managed in `src/AuthContext.js`, which supports three modes
  selected by env flags: **CAS SSO** (prod), **dev impersonation** (`/api/user`,
  `/api/dev-impersonate`), and **mock auth** (hardcoded admin). RBAC permissions
  drive route access (`src/RouteGuard.js`, `src/constants/permissions.js`).
- The in-app **chatbot** (`src/components/ChatWidget.js`, "Henry / IRA") POSTs the
  conversation to the backend `POST /api/chat` endpoint. **All LLM prompting and
  model invocation happen server-side**; this repo contains no LLM prompts or
  API keys.

---

## Build Tools & Tooling

| Tool | Purpose |
| --- | --- |
| **CRACO** (`craco.config.js`) | Customizes CRA's webpack without ejecting. The single override relaxes webpack 5 strict ESM resolution (`fullySpecified: false`) so `@atlaskit/pragmatic-drag-and-drop` `.mjs` files (transitive via `@mui/x-scheduler`) resolve. Scripts run via `craco start/build/test`. |
| **react-scripts / webpack / Babel** | Bundling, transpilation, dev server (under CRACO). |
| **@babel/plugin-proposal-private-property-in-object** | Babel plugin pinned as a devDependency to satisfy CRA tooling. |
| **Jest + @testing-library** (`react-app/jest`) | Test runner (`craco test`). `src/setupTests.js`, `src/App.test.js`. |
| **ESLint** | `react-app` / `react-app/jest` config (via CRA). |
| **web-vitals** | ^4.2.4 — performance metric reporting (`src/reportWebVitals.js`). |

### Build scripts (`package.json`)

- `npm start` → `craco start` (dev server; port from `PORT`, default 3000/3002)
- `npm run build` → `craco build` (production bundle to `build/`)
- `npm test` → `craco test`
- `npm run eject` → `react-scripts eject` (escape hatch; not used)

---

## External APIs / Services Consumed

- **FastAPI backend (StudentApi-py)** — REST/JSON API for all student, class,
  assignment, compensation, cost-center, bulk-upload, analytics, audit, and chat
  logic. Base URL via `REACT_APP_API_URL`.
- **ASU CAS (Central Authentication Service)** — SSO in production, brokered by
  the backend (`/auth/login`, `/auth/logout`). The frontend only redirects to it.
- **MUI X license server** — Pro/Premium grid/chart components validate a license
  key (`REACT_APP_MUI_LICENSE_KEY`); components run with a watermark if absent.

See `SERVICES.md` for hosted-service details.
