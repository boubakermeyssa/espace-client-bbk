# Running this project on Replit

This is a Node.js 18+ Express app serving static HTML from `public/` and reading Airtable server-side. There is no build step.

- The **Start application** workflow runs `PORT=5000 npm start` and serves the Replit web preview.
- To run locally outside Replit, use `npm install` then `npm start` (default port 3000).
- `/test-documents` displays all records from the Airtable `Documents` table using the server-only `/api/documents` route. The route also reads `Clients` to resolve linked client names.
- `AIRTABLE_TOKEN` and `AIRTABLE_BASE_ID` are required for the document test page. `SESSION_SECRET` is reserved for Lot 3.
- The current login page is only a visual form; it does not authenticate users. Per-client access control and sessions are planned for Lot 3.