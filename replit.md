# Running this project on Replit

This is a Node.js 18+ Express app serving static HTML from `public/`. There is no build step.

- The **Start application** workflow runs `PORT=5000 npm start` and serves the Replit web preview.
- To run locally outside Replit, use `npm install` then `npm start` (default port 3000).
- The current login page is only a visual form; it does not authenticate users. Airtable integration, document access, and sessions are planned but not implemented. No external credentials are needed for the current app.