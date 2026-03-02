# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev      # Start development server (port 5173, Vite default)
npm run build    # Production build (outputs to dist/)
npm run preview  # Preview production build locally
```

## Tech Stack

- **React 19** with TypeScript
- **Vite** for build tooling
- **Axios** for HTTP requests
- **Plaid** (react-plaid-link) for bank account integration
- **Tailwind CSS** (loaded via CDN in index.html)
- **@react-oauth/google** for Google Sign-In

## Architecture Overview

### Entry Point & Routing
`App.tsx` is the root component handling:
- URL-based routing for auth pages (`/verify-email`, `/reset-password`, `/forgot-password`)
- Screen switching between main dashboard views (Grow, Unplanned, Monthlies, Fixed, Income)
- Bank sync state management
- Conditional rendering based on auth state and bank connection status

### State Management
Two React Context providers:
- **AuthContext** (`AuthContext.tsx`): Authentication state (token, user) and all API data-fetching methods
- **AccountFilterContext** (`contexts/AccountFilterContext.tsx`): Bank account selection state with localStorage persistence

### API Configuration
- API base URL configured via `VITE_API_URL` environment variable
- Centralized in `config/api.ts` with `getApiUrl()` helper
- All API calls use Bearer token authentication
- Backend endpoints documented in `AuthContext.tsx` (see `fetchGrow`, `fetchMonthlies`, `fetchFixed`, etc.)

### Key API Endpoints (defined in AuthContext)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/budget/grow` | Weekly savings/grow data |
| GET | `/api/monthlies` | Monthly category expenses |
| GET | `/api/fixed` | Fixed costs |
| GET | `/unplanned` | Unplanned expenses by week |
| GET | `/income` | Income comparison data |
| GET | `/api/plaid/accounts` | Connected bank accounts |
| PATCH | `/transactions/{id}/category` | Update transaction category |

### Component Organization
- `components/` contains all screen components (GrowScreen, MonthliesScreen, etc.)
- `components/shared.tsx` has utility functions like `formatCurrency()`
- `types.ts` defines all TypeScript interfaces and the Screen enum
- `constants.tsx` contains SVG icon components

### Authentication Flow
- JWT token stored in localStorage as `authToken`
- User data persisted in localStorage as `user`
- Standalone auth pages don't require AuthProvider (verify-email, reset-password)
- Password requirements: 8+ chars, uppercase letter, digit

### Google OAuth Flow
- App wrapped with `GoogleOAuthProvider` in `App.tsx` (reads `VITE_GOOGLE_CLIENT_ID`)
- Google Sign-In button in both login and register modals (`WelcomeScreen.tsx`)
- New Google users: `POST /api/auth/google` → `needs_password: true` → set-password step → full JWT
- Returning Google users: `POST /api/auth/google` → full JWT (or 2FA flow if enabled)
- Google Cloud Console OAuth Client ID: `481768223121-o9oukefhruf75cb86ltnbj8sr4vodk2o.apps.googleusercontent.com`
- Authorized JavaScript origins: `https://www.cashgrow.net`, `http://localhost:5173`

## Environment Variables

```bash
VITE_API_URL=http://localhost:8000/api        # Backend API URL
VITE_GOOGLE_CLIENT_ID=<from Google Console>   # Google OAuth Client ID
```

Production uses:
- `VITE_API_URL=https://cashgrow-backend-api-481768223121.northamerica-northeast2.run.app`
- `VITE_GOOGLE_CLIENT_ID=481768223121-o9oukefhruf75cb86ltnbj8sr4vodk2o.apps.googleusercontent.com`

## Deployment

- **Primary**: Netlify (configured in `netlify.toml`)
- **Alternative**: Docker (multi-stage build with Nginx)
- SPA routing: All paths redirect to index.html
