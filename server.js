// Espace client BBK — Lots 1, 2, 3 & 4
// Serveur Express : authentification, sessions et consultation sécurisée des documents clients.

const express = require("express");
const path = require("path");
const session = require("express-session");

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");
const AIRTABLE_API_URL = "https://api.airtable.com/v0";
const SESSION_SECRET = process.env.SESSION_SECRET || "bbk_secret_key_espace_client_2026";

// Middleware pour analyser le corps des requêtes (JSON et formulaires)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration des sessions Express
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // passer à true si HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 24h
    },
  })
);

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

function getFieldValue(fields, ...possibleNames) {
  if (!fields) return null;
  for (const name of possibleNames) {
    if (fields[name] !== undefined && fields[name] !== null && fields[name] !== "") {
      return fields[name];
    }
  }

  const lowerKeys = Object.keys(fields).reduce((acc, key) => {
    acc[key.toLowerCase()] = fields[key];
    return acc;
  }, {});

  for (const name of possibleNames) {
    const val = lowerKeys[name.toLowerCase()];
    if (val !== undefined && val !== null && val !== "") {
      return val;
    }
  }

  return null;
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

// Données de démonstration (utilisées en développement local si Airtable n'est pas configuré)
const DEMO_CLIENTS = [
  {
    id: "rec_demo_1",
    nom: "Maison Haute Couture",
    email: "demo@agence-bbk.fr",
    code: "bbk2026",
  },
  {
    id: "rec_demo_2",
    nom: "Luxe & Prestige Paris",
    email: "client@maison-luxe.fr",
    code: "luxe2026",
  },
];

const DEMO_DOCUMENTS = [
  {
    id: "doc_1",
    nom: "Brief Stratégique — Campagne Printemps 2026",
    client: "Maison Haute Couture",
    type: "Brief",
    date: "2026-03-15",
    url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
  {
    id: "doc_2",
    nom: "Planning de Production & Tournage Studio",
    client: "Maison Haute Couture",
    type: "Planning",
    date: "2026-03-20",
    url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
  {
    id: "doc_3",
    nom: "Facture F-2026-042 — Stratégie Brand Platform",
    client: "Maison Haute Couture",
    type: "Facture",
    date: "2026-03-01",
    url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
  {
    id: "doc_4",
    nom: "Visuels HD & Kit Médias Réseaux Sociaux",
    client: "Maison Haute Couture",
    type: "Visuel",
    date: "2026-03-22",
    url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200",
  },
  {
    id: "doc_5",
    nom: "Brief Créatif — Lancement Parfum Prestige",
    client: "Luxe & Prestige Paris",
    type: "Brief",
    date: "2026-02-10",
    url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
  {
    id: "doc_6",
    nom: "Facture F-2026-018 — Événementiel & Scénographie",
    client: "Luxe & Prestige Paris",
    type: "Facture",
    date: "2026-02-15",
    url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
];

async function authenticateClient(email, code) {
  const normalizedEmail = (email || "").trim().toLowerCase();
  const normalizedCode = (code || "").trim();

  let clientRecords;
  try {
    clientRecords = await fetchAirtableRecords("Clients");
  } catch (error) {
    if (error.code === "MISSING_AIRTABLE_CONFIG") {
      console.log("ℹ️ Airtable non configuré : utilisation du mode démonstration pour l'authentification.");
      const demoMatch = DEMO_CLIENTS.find(
        (c) => c.email.toLowerCase() === normalizedEmail && c.code === normalizedCode
      );
      if (demoMatch) {
        return { id: demoMatch.id, nom: demoMatch.nom, email: demoMatch.email };
      }
      return null;
    }
    throw error;
  }

  const foundRecord = clientRecords.find((record) => {
    const fields = record.fields || {};
    const clientEmail = getFieldValue(fields, "Email", "email", "E-mail", "Mail");
    const clientCode = getFieldValue(fields, "Code d'accès", "Code d'acces", "Code", "code", "Mot de passe");

    if (!clientEmail || !clientCode) return false;

    return (
      String(clientEmail).trim().toLowerCase() === normalizedEmail &&
      String(clientCode).trim() === normalizedCode
    );
  });

  if (!foundRecord) {
    return null;
  }

  const fields = foundRecord.fields || {};
  const clientNom = getFieldValue(fields, "Nom", "nom", "Société", "Raison sociale", "Client") || "Client";

  return {
    id: foundRecord.id,
    nom: clientNom,
    email: getFieldValue(fields, "Email", "email", "E-mail", "Mail") || normalizedEmail,
  };
}

async function getDocuments() {
  let clientRecords, documentRecords;
  try {
    [clientRecords, documentRecords] = await Promise.all([
      fetchAirtableRecords("Clients"),
      fetchAirtableRecords("Documents"),
    ]);
  } catch (error) {
    if (error.code === "MISSING_AIRTABLE_CONFIG") {
      console.log("ℹ️ Airtable non configuré : renvoi des documents de démonstration.");
      return DEMO_DOCUMENTS;
    }
    throw error;
  }

  const clientNames = new Map(
    clientRecords.map((client) => [client.id, getFieldValue(client.fields || {}, "Nom", "nom", "Société") || "Client sans nom"])
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
      date: fields["Date de dépôt"] || fields["Date"] || null,
      url: getDocumentUrl(fields),
    };
  });
}

async function getClientDocuments(client) {
  let clientRecords, documentRecords;
  try {
    [clientRecords, documentRecords] = await Promise.all([
      fetchAirtableRecords("Clients"),
      fetchAirtableRecords("Documents"),
    ]);
  } catch (error) {
    if (error.code === "MISSING_AIRTABLE_CONFIG") {
      console.log("ℹ️ Airtable non configuré : renvoi des documents filtrés pour le mode démonstration.");
      return DEMO_DOCUMENTS.filter(
        (doc) => doc.client.toLowerCase() === (client.nom || "").toLowerCase()
      );
    }
    throw error;
  }

  const clientMap = new Map(
    clientRecords.map((c) => [c.id, getFieldValue(c.fields || {}, "Nom", "nom", "Société") || "Client"])
  );

  return documentRecords
    .filter((record) => {
      const fields = record.fields || {};
      const clientIds = getClientIds(fields["Client"]);

      // 1. ID client dans la relation Airtable
      if (clientIds.includes(client.id)) {
        return true;
      }

      // 2. Champ texte client
      const rawClientField = fields["Client"];
      if (typeof rawClientField === "string" && client.nom) {
        return rawClientField.toLowerCase().includes(client.nom.toLowerCase());
      }

      // 3. Verification inversée via le map des clients
      for (const id of clientIds) {
        const name = clientMap.get(id);
        if (name && client.nom && name.toLowerCase().includes(client.nom.toLowerCase())) {
          return true;
        }
      }

      return false;
    })
    .map((record) => {
      const fields = record.fields || {};
      return {
        id: record.id,
        nom: fields["Nom"] || "Document sans nom",
        type: fields["Type"] || "Autre",
        date: fields["Date de dépôt"] || fields["Date"] || null,
        url: getDocumentUrl(fields),
      };
    });
}

async function createAirtableRecord(tableName, fields) {
  let token, baseId;
  try {
    const config = getAirtableConfig();
    token = config.token;
    baseId = config.baseId;
  } catch (err) {
    if (err.code === "MISSING_AIRTABLE_CONFIG") {
      return null;
    }
    throw err;
  }

  const url = `${AIRTABLE_API_URL}/${encodeURIComponent(baseId)}/${encodeURIComponent(tableName)}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields }),
  });

  if (!response.ok) {
    const error = new Error(`Airtable creation direct status ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return await response.json();
}

async function deleteAirtableRecord(tableName, recordId) {
  let token, baseId;
  try {
    const config = getAirtableConfig();
    token = config.token;
    baseId = config.baseId;
  } catch (err) {
    if (err.code === "MISSING_AIRTABLE_CONFIG") {
      return null;
    }
    throw err;
  }

  const url = `${AIRTABLE_API_URL}/${encodeURIComponent(baseId)}/${encodeURIComponent(tableName)}/${encodeURIComponent(recordId)}`;
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = new Error(`Airtable deletion error status ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return await response.json();
}

// Middleware de protection Admin
function requireAdminAuth(req, res, next) {
  if (req.session && req.session.admin) {
    return next();
  }
  if (req.path.startsWith("/api/")) {
    return res.status(401).json({ error: "Non autorisé. Veuillez vous connecter en tant qu'administrateur." });
  }
  return res.redirect("/admin/login");
}

// Middleware de protection d'accès Client
function requireAuth(req, res, next) {
  if (req.session && req.session.client) {
    return next();
  }
  if (req.path.startsWith("/api/")) {
    return res.status(401).json({ error: "Non autorisé. Veuillez vous connecter." });
  }
  return res.redirect("/login");
}

// Fichiers statiques
app.use(express.static(PUBLIC_DIR));

// Session client courante : /api/me
app.get("/api/me", (req, res) => {
  if (req.session && req.session.client) {
    return res.json({ loggedIn: true, client: req.session.client });
  }
  return res.json({ loggedIn: false });
});

// Session admin courante : /api/admin/me
app.get("/api/admin/me", (req, res) => {
  if (req.session && req.session.admin) {
    return res.json({ loggedIn: true, admin: req.session.admin });
  }
  return res.json({ loggedIn: false });
});

// Lot 3 : Connexion Client (email + code)
app.post("/api/login", async (req, res) => {
  const { email, code } = req.body || {};

  if (!email || !code) {
    return res.status(400).json({ error: "L'email et le code d'accès sont requis." });
  }

  try {
    const client = await authenticateClient(email, code);

    if (!client) {
      return res.status(401).json({ error: "Email ou code d'accès incorrect." });
    }

    req.session.client = client;
    return res.json({
      ok: true,
      message: "Connexion réussie.",
      client: { nom: client.nom, email: client.email },
    });
  } catch (error) {
    console.error("Erreur lors de la connexion client :", error);

    if (error.code === "MISSING_AIRTABLE_CONFIG") {
      return res.status(500).json({
        error: "La configuration Airtable est incomplète côté serveur.",
      });
    }

    return res.status(502).json({
      error: "Erreur de communication avec la base de données.",
    });
  }
});

// Lot 5 : Connexion Admin Back-Office
app.post("/api/admin/login", (req, res) => {
  const { email, password } = req.body || {};
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@agence-bbk.fr";
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "bbk_admin_2026";

  if ((email || "").trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() && (password || "").trim() === ADMIN_PASSWORD) {
    req.session.admin = { email: ADMIN_EMAIL, role: "admin" };
    return res.json({ ok: true, message: "Connexion administration réussie." });
  }

  return res.status(401).json({ error: "Identifiants administrateur incorrects." });
});

// Lot 3 & 5 : Déconnexion
function handleLogout(req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.error("Erreur lors de la déconnexion :", err);
    }
    res.clearCookie("connect.sid");
    if (req.headers.accept && req.headers.accept.includes("application/json")) {
      return res.json({ ok: true, message: "Déconnexion réussie." });
    }
    return res.redirect("/login");
  });
}

app.post("/api/logout", handleLogout);
app.get("/logout", handleLogout);
app.get("/api/logout", handleLogout);

// Route d'accès à la page de connexion client
app.get("/login", (req, res) => {
  if (req.session && req.session.client) {
    return res.redirect("/espace-client");
  }
  res.sendFile(path.join(PUBLIC_DIR, "login.html"));
});

// Route d'accès à la page de connexion admin
app.get("/admin/login", (req, res) => {
  if (req.session && req.session.admin) {
    return res.redirect("/backoffice");
  }
  res.sendFile(path.join(PUBLIC_DIR, "admin-login.html"));
});

// Lot 4 : Espace client protégé
app.get("/espace-client", requireAuth, (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "espace-client.html"));
});

// Lot 5 : Back-Office Agence protégé
app.get("/backoffice", requireAdminAuth, (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "backoffice.html"));
});
app.get("/admin", (req, res) => res.redirect("/backoffice"));

// Lot 4 : API documents du client connecté
app.get("/api/client/documents", requireAuth, async (req, res) => {
  try {
    const documents = await getClientDocuments(req.session.client);
    res.json(documents);
  } catch (error) {
    console.error("Erreur lors de la récupération des documents du client :", error);

    if (error.code === "MISSING_AIRTABLE_CONFIG") {
      return res.status(500).json({
        error: "La configuration Airtable est incomplète côté serveur.",
      });
    }

    return res.status(502).json({
      error: "Impossible de récupérer vos documents depuis Airtable.",
    });
  }
});

// Lot 5 : API Admin — Liste de tous les clients
app.get("/api/admin/clients", requireAdminAuth, async (req, res) => {
  try {
    let clientRecords;
    try {
      clientRecords = await fetchAirtableRecords("Clients");
    } catch (err) {
      if (err.code === "MISSING_AIRTABLE_CONFIG") {
        return res.json(DEMO_CLIENTS);
      }
      throw err;
    }

    const clients = clientRecords.map((record) => {
      const fields = record.fields || {};
      return {
        id: record.id,
        nom: getFieldValue(fields, "Nom", "nom", "Société") || "Client sans nom",
        email: getFieldValue(fields, "Email", "email", "E-mail") || "Non renseigné",
        code: getFieldValue(fields, "Code d'accès", "Code d'acces", "Code", "code") || "••••",
      };
    });

    res.json(clients);
  } catch (error) {
    console.error("Erreur récupération clients admin :", error);
    res.status(500).json({ error: "Impossible de récupérer la liste des clients." });
  }
});

// Lot 5 : API Admin — Création d'un client
app.post("/api/admin/clients", requireAdminAuth, async (req, res) => {
  const { nom, email, code } = req.body || {};

  if (!nom || !email || !code) {
    return res.status(400).json({ error: "Le nom, l'email et le code d'accès sont requis." });
  }

  try {
    const fields = {
      "Nom": nom.trim(),
      "Email": email.trim().toLowerCase(),
      "Code d'accès": code.trim(),
    };

    const result = await createAirtableRecord("Clients", fields);

    if (!result) {
      // Demo fallback mode
      const newDemoClient = {
        id: "rec_demo_" + Date.now(),
        nom: nom.trim(),
        email: email.trim().toLowerCase(),
        code: code.trim(),
      };
      DEMO_CLIENTS.push(newDemoClient);
      return res.json({ ok: true, client: newDemoClient, demo: true });
    }

    return res.json({ ok: true, client: { id: result.id, nom, email, code } });
  } catch (error) {
    console.error("Erreur création client admin :", error);
    res.status(500).json({ error: "Erreur lors de la création du client dans Airtable." });
  }
});

// Lot 5 : API Admin — Dépôt / Création d'un document
app.post("/api/admin/documents", requireAdminAuth, async (req, res) => {
  const { nom, clientId, type, date, url } = req.body || {};

  if (!nom || !clientId) {
    return res.status(400).json({ error: "Le nom du document et le client destinataire sont requis." });
  }

  try {
    const fields = {
      "Nom": nom.trim(),
      "Client": [clientId],
      "Type": type || "Autre",
      "Date de dépôt": date || new Date().toISOString().split("T")[0],
      "Lien Drive": url || "",
    };

    const result = await createAirtableRecord("Documents", fields);

    if (!result) {
      // Demo fallback mode
      const clientObj = DEMO_CLIENTS.find((c) => c.id === clientId || c.nom === clientId) || { nom: clientId };
      const newDemoDoc = {
        id: "doc_" + Date.now(),
        nom: nom.trim(),
        client: clientObj.nom,
        type: type || "Autre",
        date: date || new Date().toISOString().split("T")[0],
        url: url || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      };
      DEMO_DOCUMENTS.unshift(newDemoDoc);
      return res.json({ ok: true, document: newDemoDoc, demo: true });
    }

    return res.json({ ok: true, message: "Document déposé avec succès." });
  } catch (error) {
    console.error("Erreur dépôt document admin :", error);
    res.status(500).json({ error: "Erreur lors du dépôt du document dans Airtable." });
  }
});

// Lot 5 : API Admin — Suppression d'un document
app.delete("/api/admin/documents/:id", requireAdminAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await deleteAirtableRecord("Documents", id);

    if (!result) {
      // Demo fallback mode
      const idx = DEMO_DOCUMENTS.findIndex((d) => d.id === id);
      if (idx !== -1) {
        DEMO_DOCUMENTS.splice(idx, 1);
      }
      return res.json({ ok: true, message: "Document supprimé." });
    }

    return res.json({ ok: true, message: "Document supprimé dans Airtable." });
  } catch (error) {
    console.error("Erreur suppression document admin :", error);
    res.status(500).json({ error: "Erreur lors de la suppression du document." });
  }
});

// Lot 2 : API de test (tous les documents pour l'administration)
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


