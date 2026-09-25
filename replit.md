# Running this project on Replit

This is a Node.js 18+ Express app serving static HTML from `public/` and managing per-client document access via Airtable server-side. There is no build step.

- The **Start application** workflow runs `PORT=5000 npm start` and serves the Replit web preview.
- To run locally outside Replit, use `npm install` then `npm start` (default port 3000).
- Authentication flow (Lot 3): Users authenticate via `/login` (`POST /api/login`) with email and access code against the Airtable `Clients` table. Sessions are maintained via `express-session` (`SESSION_SECRET`).
- Client dashboard (Lot 4): Authenticated users access `/espace-client` (`GET /api/client/documents`), which filters documents specifically belonging to their client account. Includes live search, document type filtering, date sorting, and file opening.
- `/test-documents` displays all records from Airtable for administrative inspection (`/api/documents`).
- `AIRTABLE_TOKEN` and `AIRTABLE_BASE_ID` connect to the live Airtable base. If omitted, the app falls back gracefully to a Demo mode (`demo@agence-bbk.fr` / `bbk2026`).