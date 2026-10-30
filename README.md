# NotesFlow

NotesFlow is a full-stack notes workspace for capturing, finding, and organizing personal notes. It includes account registration and login, private notes, search, tags, pinning, archiving, and a responsive React interface.

## Problem and approach

Small ideas and reminders tend to get scattered across apps and paper. NotesFlow gives them a searchable home while keeping each account's notes scoped to the signed-in user. The frontend uses a REST API; Express validates every request, Mongoose stores users and notes in MongoDB, and an HttpOnly cookie carries the signed session.

## Features

- Register, log in, restore a session after refresh, and log out.
- Create, edit, and permanently delete notes with a confirmation step.
- Pin notes, archive them, and restore archived notes.
- Search note titles and content, filter by tag, sort, and paginate.
- Choose a note color and add up to 10 tags.
- Responsive landing, authentication, notes, and archive views.
- Server-side validation, password hashing, rate limits, security headers, explicit credentialed CORS, and per-user note ownership checks.

## Technology

**Client:** React 18, Vite, Tailwind CSS 4, React Router, Axios, Context API, Lucide React, React Hot Toast, Vitest, and React Testing Library.

**Server:** Node.js ES modules, Express 4, MongoDB, Mongoose, JWT, bcryptjs, Zod, Helmet, CORS, cookie-parser, and express-rate-limit. API tests use Node's test runner, Supertest, and an isolated `mongodb-memory-server` database.

## Architecture and request flow

```text
Browser (React pages and Context)
  -> Axios service (with credentials)
  -> Express middleware (CORS, security headers, validation, authentication)
  -> route controller
  -> Mongoose model
  -> MongoDB
```

The server separates configuration, models, validation, routes, controllers, middleware, and small utilities. The client separates pages, reusable components, authentication state, hooks, routes, and API services. Authentication uses an HttpOnly cookie; the JWT is never exposed to browser JavaScript or stored in local storage. Each note query includes the authenticated user's ID. A submitted `owner` field is rejected rather than trusted.

### Folder structure

```text
NotesFlow/
├── client/
│   ├── src/
│   │   ├── components/{common,layout,notes}/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   └── test/
│   ├── .env.example
│   └── package.json
├── server/
│   ├── src/{config,controllers,middleware,models,routes,utils,validators}/
│   ├── tests/
│   ├── .env.example
│   └── package.json
├── .gitignore
├── package.json
└── README.md
```

### Data models

- **User:** trimmed name, normalized unique email, bcrypt password hash, timestamps. The password field is excluded from ordinary queries and from JSON output.
- **Note:** title, content, owner reference, allowlisted color, normalized tags, pin/archive booleans, timestamps. Compound indexes support a user's archive, pin, and updated-time listing; an owner/tag index supports tag filtering.

## API

All routes use the `/api` prefix and JSON responses. Successful responses use `{ "success": true, "data": ... }`; errors use `{ "success": false, "message": "...", "errors": [...] }` when field details are available. The session cookie is named by `COOKIE_NAME`.

### Authentication

| Method | URL | Authentication | Body | Success |
|---|---|---|---|---|
| POST | `/api/auth/register` | No | `{ "name": "Jamie Parker", "email": "jamie@example.com", "password": "at-least-8-chars" }` | `201`, `{ data: { user } }`, sets HttpOnly cookie |
| POST | `/api/auth/login` | No | `{ "email": "jamie@example.com", "password": "..." }` | `200`, `{ data: { user } }`, sets cookie |
| POST | `/api/auth/logout` | No | none | `200`, clears cookie |
| GET | `/api/auth/me` | Yes | none | `200`, `{ data: { user } }` |

Login and registration share a rate limit of 12 attempts per 15 minutes per IP. Login failures use the same message for unknown email and incorrect password.

### Notes

All note routes require the session cookie. Note payloads never accept an owner. Color is one of `paper`, `lavender`, `mint`, `peach`, `blue`, or `lemon`; tags are trimmed, lowercased, unique, and limited to 10.

| Method | URL | Body / query | Success |
|---|---|---|---|
| POST | `/api/notes` | `{ "title": "Reading list", "content": "...", "color": "paper", "tags": ["ideas"] }` | `201`, `{ data: { note } }` |
| GET | `/api/notes` | Query below | `{ data: { notes, pagination: { page, limit, total, totalPages } } }` |
| GET | `/api/notes/:id` | none | `{ data: { note } }`; inaccessible notes return 404 |
| PATCH | `/api/notes/:id` | Any non-empty subset of `title`, `content`, `color`, `tags` | `{ data: { note } }` |
| DELETE | `/api/notes/:id` | none | `{ success: true, message: "Note deleted successfully", data: {} }` |
| PATCH | `/api/notes/:id/pin` | `{ "value": true }` or `{ "value": false }` | `{ data: { note } }` |
| PATCH | `/api/notes/:id/archive` | `{ "value": true }` or `{ "value": false }` | `{ data: { note } }` |

`GET /api/notes` accepts:

| Parameter | Accepted values | Default |
|---|---|---|
| `page` | Integer >= 1 | `1` |
| `limit` | Integer 1–50 | `12` |
| `search` | Literal substring, up to 100 characters | none |
| `tag` | One tag string, up to 24 characters | none |
| `archived` | `true` or `false` | `false` |
| `sortBy` | `updatedAt`, `createdAt`, `title` | `updatedAt` |
| `order` | `asc` or `desc` | `desc` |

Pinned notes are ordered before unpinned notes. Search escapes regular-expression metacharacters and checks literal, case-insensitive substrings in title and content. It is bounded by a per-user query and pagination, but substring regular expressions can scan that user's matching corpus; a standard MongoDB text index does not provide arbitrary substring matching. For substantially larger collections, use MongoDB Atlas Search or a dedicated search index.

Common status codes: `200` successful read/update/action, `201` created, `400` invalid input or ID, `401` missing/invalid session, `403` disallowed browser origin, `404` missing route/note, `409` duplicate email, `429` rate limited, and `500` unexpected server error. Production errors do not include stack traces or database details.

## Setup

Requirements: Node.js 22.12 or newer, npm, and MongoDB 6.0+ (local or hosted). From the project root:

1. Install workspaces:

   ```bash
   npm install
   ```

2. Copy `server/.env.example` to `server/.env` and set `MONGODB_URI` to your development database. Generate a private JWT key locally, for example with `node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"`, then place the result in `JWT_SECRET`. Do not commit either `.env` file.

3. Copy `client/.env.example` to `client/.env`. Set `VITE_API_URL` if the API is not at `http://localhost:5000/api`.

4. Start both services:

   ```bash
   npm run dev
   ```

   Open the Vite URL shown in the terminal (normally `http://localhost:5173`). The API health endpoint is `http://localhost:5000/api/health`.

Other root commands:

```bash
npm run build  # production client build
npm test       # server API tests, then client component tests
npm run lint   # server syntax checks and client ESLint
```

Server-only commands can be run with `npm run dev --workspace server`, `npm test --workspace server`, or `npm run lint --workspace server`. Client equivalents use `--workspace client`.

### Environment variables

| Variable | Service | Purpose |
|---|---|---|
| `PORT` | Server | Listen port; defaults to `5000` |
| `NODE_ENV` | Server | `development`, `test`, or `production` |
| `MONGODB_URI` | Server | MongoDB connection string; required |
| `JWT_SECRET` | Server | Signing secret of at least 32 characters; required |
| `JWT_EXPIRES_IN` | Server | JWT lifetime; defaults to `7d` |
| `COOKIE_NAME` | Server | Session cookie name |
| `COOKIE_SAME_SITE` | Server | `lax`, `strict`, or `none`; defaults to `lax` |
| `COOKIE_DOMAIN` | Server | Optional cookie domain |
| `CLIENT_URL` | Server | Allowed frontend origin(s), comma-separated; defaults to `http://localhost:5173` |
| `VITE_API_URL` | Client | API base URL; defaults to `http://localhost:5000/api` |

Use HTTPS in production. The cookie is HttpOnly, path `/`, and shares the configured JWT lifetime (seven days by default). It is `Secure` in production and whenever `COOKIE_SAME_SITE=none`. `SameSite=Lax` is the default. If the frontend and API are on separate sites, configure `COOKIE_SAME_SITE=none` with HTTPS, set exact `CLIENT_URL` origins, and preserve the server's unsafe-request Origin check. Never use wildcard origins with credentialed CORS.

## Testing and verification

`npm test` runs the API suite against a temporary in-memory MongoDB server and client tests under jsdom. It does not use a developer or production database. `npm run build` creates the Vite production bundle in `client/dist`. Test outcomes for this checkout are recorded in the delivery summary; no deployment or live MongoDB service is assumed by the documentation.

## Deployment

Deploy the client as a static Vite site and the server as a Node.js service. Build with `npm run build`, serve `client/dist`, and run the server with `npm start --workspace server`. Provision a MongoDB database and set server environment variables in the hosting provider's secret manager. Set `CLIENT_URL` to the deployed frontend origin, configure HTTPS and cookie settings for the chosen domain layout, and set `VITE_API_URL` to the deployed API before building the client. Restrict database network access to the server, and use a managed secret for `JWT_SECRET`.

## Screenshots

Screenshots are not included yet. Add verified desktop and mobile captures here when available.

## Known limitations and next steps

- Literal substring search is suited to modest per-user note collections; Atlas Search is a future option for larger datasets.
- The interface has not been connected to a hosted deployment or tested against a production MongoDB account.
- Add end-to-end browser coverage and accessibility audits before a public launch.
- A future iteration could add richer note formatting, account recovery, and configurable retention policies.
