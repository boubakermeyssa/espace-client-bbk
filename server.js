// Espace client BBK — Lots 1 et 2
// Serveur Express : sert les pages statiques et l'API Airtable côté serveur.

const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");
const AIRTABLE_API_URL = "https://api.airtable.com/v0";

function getAirtableConfig() {
  const { AIRTABLE_TOKEN, AIRTABLE_BASE_ID } = process.env;

  if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID) {
    const error = new Error("La configuration Airtable est incomplète.");
    error.code = "MISSING_AIRTABLE_CONFIG";
    throw error;
  }

  return { token: AIRTABLE_TOKEN, baseId: AIRTABLE_BASE_ID };
}

async function fetchAirtableRecords(tableName) {
  const { token, baseId } = getAirtableConfig();
  const records = [];
  let offset;

  do {
    const url = new URL(
      `${AIRTABLE_API_URL}/${encodeURIComponent(baseId)}/${encodeURIComponent(tableName)}`
    );

    if (offset) {
      url.searchParams.set("offset", offset);
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = new Error(`Airtable a répondu avec le statut ${response.status}.`);
      error.status = 502;
      throw error;
    }

    const data = await response.json();
    records.push(...(data.records || []));
    offset = data.offset;
  } while (offset);

  return records;
}

function getDocumentUrl(fields) {
  const attachments = Array.isArray(fields["Fichier"]) ? fields["Fichier"] : [];
  const attachmentUrl = attachments.find((attachment) => attachment?.url)?.url;
  const driveUrl = typeof fields["Lien Drive"] === "string" ? fields["Lien Drive"] : "";

  return attachmentUrl || driveUrl || null;
}

function getClientIds(value) {
  if (Array.isArray(value)) {
    return value
      .map((client) => (typeof client === "string" ? client : client?.id))
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return [value];
  }

  return [];
}

async function getDocuments() {
  const [clientRecords, documentRecords] = await Promise.all([
    fetchAirtableRecords("Clients"),
    fetchAirtableRecords("Documents"),
  ]);

  const clientNames = new Map(
    clientRecords.map((client) => [client.id, client.fields?.Nom || "Client sans nom"])
  );

  return documentRecords.map((record) => {
    const fields = record.fields || {};
    const clientIds = getClientIds(fields["Client"]);
    const clientName =
      clientIds.map((id) => clientNames.get(id)).filter(Boolean).join(", ") ||
      (typeof fields["Client"] === "string" ? fields["Client"] : "Client non renseigné");

    return {
      nom: fields["Nom"] || "Document sans nom",
      client: clientName,
      type: fields["Type"] || "Autre",
      date: fields["Date de dépôt"] || null,
      url: getDocumentUrl(fields),
    };
  });
}

// Fichiers statiques (index.html est servi automatiquement sur "/")
app.use(express.static(PUBLIC_DIR));

// URL propre pour la page de connexion : /login -> public/login.html
app.get("/login", (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "login.html"));
});

// Lot 2 : lecture des documents Airtable. Le token reste uniquement côté serveur.
app.get("/api/documents", async (req, res) => {
  try {
    const documents = await getDocuments();
    res.json(documents);
  } catch (error) {
    console.error("Erreur lors de la récupération des documents Airtable :", error);

    if (error.code === "MISSING_AIRTABLE_CONFIG") {
      return res.status(500).json({
        error: "La configuration Airtable est incomplète côté serveur.",
      });
    }

    return res.status(502).json({
      error: "Impossible de récupérer les documents depuis Airtable.",
    });
  }
});

app.get("/test-documents", (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "test-documents.html"));
});

// Page inconnue : renvoie vers l'accueil
app.use((req, res) => {
  res.redirect("/");
});

app.listen(PORT, () => {
  console.log(`Espace client BBK en ligne sur http://localhost:${PORT}`);
});
