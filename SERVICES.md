---
project: projects/ui-student-py
type: services
---

# SERVICES – ui-student-py

External hosted services this frontend depends on or is deployed to. Detected
from `.env`, `.github/workflows/`, `package.json`, source code, and `README.md`.

---

## Hosting / Deployment

### Azure Static Web Apps (frontend host)
- **Role:** Hosts the built React app (`build/` output).
- **Live URL:** https://blue-moss-0cf2b2f10.1.azurestaticapps.net/
- **Detected from:** `.github/workflows/azure-static-web-apps-blue-moss-0cf2b2f10.yml`
  (`Azure/static-web-apps-deploy@v1`), `public/web.config`, README.
- **Deploy:** GitHub Actions on push / PR to `main`.
- **Secrets (GitHub Actions):**
  `AZURE_STATIC_WEB_APPS_API_TOKEN_BLUE_MOSS_0CF2B2F10`,
  `REACT_APP_API_BASE`, `REACT_APP_ALLOWED_EMAILS`,
  `REACT_APP_MASTER_PASSWORD`, `REACT_APP_MUI_LICENSE_KEY`.

### Azure App Service (backend host — consumed, not in this repo)
- **Role:** Hosts the paired FastAPI backend that this frontend calls for all data.
- **Live URL / Swagger:** https://studenthiringapp-d8cxb6h0e8eyevhf.westus-01.azurewebsites.net/docs
- **Detected from:** README; frontend targets it via `REACT_APP_API_URL` /
  `REACT_APP_API_BASE`.
- **Note:** Backend code is in a separate repository (`StudentApi-py`). Azure SQL
  and any LLM provider used by the chatbot are configured **on the backend**, not
  here.

---

## CI/CD

### GitHub Actions
- **Role:** Build-and-deploy pipeline for the Static Web App (auto-deploy on push
  to `main`; preview environments on PRs; teardown on PR close).
- **Detected from:** `.github/workflows/azure-static-web-apps-blue-moss-0cf2b2f10.yml`.

---

## Third-Party Licensed Service

### MUI X (Pro / Premium) license
- **Role:** License validation for `@mui/x-data-grid-pro/-premium`,
  `@mui/x-charts-pro/-premium`, date pickers, tree view, and scheduler.
- **Detected from:** `REACT_APP_MUI_LICENSE_KEY` (`.env`, CI secrets);
  `LicenseInfo.setLicenseKey(...)` in `src/App.js`.
- **Note:** A commercial license key; grids/charts still function (with a
  watermark) if unset.

---

## Authentication

### ASU CAS (Central Authentication Service) – production SSO
- **Role:** Single sign-on for production users.
- **Detected from:** `REACT_APP_USE_CAS` flag and `/auth/login` / `/auth/logout`
  redirects in `src/AuthContext.js`, `src/utils/apiClient.js`.
- **Note:** The CAS flow is brokered by the backend; the frontend only redirects.
  In local/dev mode (`REACT_APP_USE_CAS=false`) CAS is bypassed in favor of dev
  impersonation or mock auth.

---

## Not present in this repository

- **No database, cache, queue, object storage, email, payment, analytics-vendor,
  or LLM API credentials** are configured in this frontend. The chatbot
  (`ChatWidget.js`) calls the backend `/api/chat` endpoint; any LLM provider key
  and prompt live server-side.
