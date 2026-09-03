# Office Shift Manager

A full-stack application for managing **office working shifts** and calculating **working time**. It lets a user configure their working hours and weekly holidays, then calculate the total hours worked between a start and end date/time — excluding weekends and holidays.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, plain CSS (light/dark mode) |
| Backend | Node.js, Express 5 |
| Database | PostgreSQL (`pg`) |
| Auth | JWT (`jsonwebtoken`) + password hashing (`bcryptjs`) |
| Architecture | Unified backend (single service) — original microservices retained for local dev |

---

## Project Structure

```
Office shift Manager/
├── backend/                        # Node.js backend
│   ├── .env                        # JWT secret + DATABASE_URL config
│   ├── src/
│   │   ├── db.js                   # Shared PostgreSQL pool + queries
│   │   ├── authMiddleware.js       # Shared JWT signing + verification
│   │   └── server.js               # UNIFIED production server (API + static frontend)
│   └── microservices/              # Original split services (local dev)
│       ├── auth-service/           # Login / Register / profile (port 5003)
│       │   ├── index.js
│       │   └── routes.js
│       └── shift-manager-service/  # Calculate + save/load settings (port 3002)
│           ├── index.js
│           └── routes/
│               ├── settings.js     # GET/POST per-user shift + holidays
│               └── shift.js        # POST /calculate
├── frontend/                       # React + Vite app
│   └── src/
│       ├── App.jsx                 # Auth guard + tab layout
│       ├── components/
│       │   ├── Auth.jsx            # Login / Register screen
│       │   ├── CalculateTab.jsx    # Date/time input + result
│       │   └── SettingsTab.jsx     # Shift + holiday configuration
│       └── App.css, index.css      # Styling
└── render.yaml                     # Render.com deployment blueprint
```

### Microservice Ports

| Service | Port | Base URL |
|---------|------|----------|
| auth-service | 5003 | `http://localhost:5003` |
| shift-manager-service | 3002 | `http://localhost:3002` |
| frontend (Vite dev) | 5173 | `http://localhost:5173` |

---

## Prerequisites

- **Node.js 18+** (recommended: 20/22 — SQLite native module builds against it)
- **npm** (bundled with Node)

The SQLite module (`better-sqlite3`) installs a native binary during `npm install`. If the install fails, ensure you have a C compiler / Python scaling installed, or Node's prebuilt binaries will be used automatically on common platforms.

---

## Setup

### 1. Install dependencies

Install the backend dependencies (root of `backend/`):

```bash
cd backend
npm install
```

Install the frontend dependencies (root of `frontend/`):

```bash
cd frontend
npm install
```

### 2. Configure the backend

Create `backend/.env` (a sample is documented in `frontend/.env.example`):

```
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=change_this_to_a_long_random_secret
```

> **Important:** Set a long random `JWT_SECRET` before sharing/deploying. All
> services read it from the same `.env` file so tokens are interchangeable.
>
> The database is **PostgreSQL**. Tables for users and settings are created
> automatically on startup.

---

## Building and Running

### Production build (unified server)

The unified server (`backend/src/server.js`) serves both the API and the built
frontend. Build the frontend and copy it next to the backend, then start:

```bash
# 1. Build the frontend
cd frontend
npm run build

# 2. Copy the dist into the backend (so the server can serve it)
cd ..
cp -r frontend/dist backend/dist

# 3. Run the unified server
cd backend
npm start
```

Then open **http://localhost:3002** in your browser (or the `PORT` you set).

### Local dev with separate microservices

The original split services still work for development:

#### Terminal 1 — auth-service

```bash
cd backend/microservices/auth-service
node index.js
```

#### Terminal 2 — shift-manager-service

```bash
cd backend/microservices/shift-manager-service
node index.js
```

#### Terminal 3 — frontend

```bash
cd frontend
npm run dev
```

Then open **http://localhost:5173** in your browser.

> For the microservices to run, set `DATABASE_URL` to a local PostgreSQL
> instance. `initDb()` is called by `src/server.js`; for standalone microservice
> dev, make sure the tables exist (run the unified server once, or run `initDb`).

---

## Deploying to Render.com (free tier)

This project includes a `render.yaml` blueprint that provisions a free
PostgreSQL database and a free web service (which builds the frontend and serves
both the API and the static site).

1. Push this repository to GitHub/GitLab.
2. In the Render dashboard, choose **New → Blueprint** and select the repo.
3. Render provisions the database and web service automatically using
   `render.yaml`.
4. Open the generated service URL.

Environment variables are provided by the blueprint: `DATABASE_URL` (from the
database), `JWT_SECRET` (auto-generated), `NODE_ENV=production`, `PORT=3000`.

> **Note:** Render's free PostgreSQL database expires after 90 days (then ~$7/mo
> for the Starter plan). The free web service sleeps after inactivity and wakes
> on the next request.

### Deploying frontend separately (optional)

If you prefer to host the frontend on a static host (e.g. Render Static Site or
Vercel), build it and set `VITE_API_URL` to the backend URL during the build:

```bash
VITE_API_URL=https://office-shift-manager.onrender.com npm run build
```

---

## Using the App

1. On first load you'll see the **login/register** screen. Create an account, or sign in.
2. **Settings** tab:
   - Set your work **shift start** and **shift end** times.
   - Toggle which days of the week are **holidays** (weekly off days).
   - Click **Save Settings** to persist them to the database.
3. **Calculate** tab:
   - Pick a **start date/time** and **end date/time**.
   - Click **Calculate** to get the total duration, number of working days, and holidays in the range — computed by the backend, excluding the configured weekly holidays.

---

## API Reference

All endpoints below are served by the unified backend under one origin
(`http://localhost:3002` locally, or your Render service URL in production).

### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | `{ email, password }` → creates user, returns JWT + user |
| POST | `/api/auth/login` | No | `{ email, password }` → validates, returns JWT + user |
| GET | `/api/auth/me` | Bearer token | Returns the logged-in user profile |

### Shift & Settings

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/shift/calculate` | No | Calculates duration for a date range |
| GET | `/settings` | Bearer token | Loads the user's saved shift + holiday settings |
| POST | `/settings` | Bearer token | Saves the user's shift + holiday settings |

**Example — calculate:**

```bash
curl -X POST http://localhost:3002/shift/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2026-09-01",
    "endDate": "2026-09-07",
    "startTime": "09:00",
    "endTime": "18:00",
    "shiftConfig": { "shiftStart": "09:00", "shiftEnd": "18:00" },
    "holidays": ["saturday", "sunday"]
  }'
```

**Response:**

```json
{ "totalHours": 45, "totalMinutes": 0, "workingDays": 5, "holidaysCount": 2 }
```

**Example — save settings** (authenticated):

```bash
curl -X POST http://localhost:3002/settings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "shiftConfig": { "shiftStart": "09:00", "shiftEnd": "18:00" },
    "holidays": ["saturday", "sunday"]
  }'
```

---

## Notes & Assumptions

- The **Database** is a single **PostgreSQL** instance shared by all services via
  `backend/src/db.js`. Tables are created automatically on startup (`initDb()`).
- Passwords are **hashed with bcrypt** before storage — never stored in plain text.
- **JWT tokens expire after 1 hour.** After that, sign in again (`src/authMiddleware.js`).
- The primary backend is the **unified** `backend/src/server.js`. The original
  `microservices/auth-service/index.js` and `microservices/shift-manager-service/index.js`
  are retained for local development only — they need a running PostgreSQL
  instance and existing tables.
- `backend/index.js` is a standalone mock/entrypoint and is **not** required for
  the app to run.
- `frontend/src/assets/hero.png`, `react.svg`, and `vite.svg` are leftover Vite
  template assets and can be removed.
