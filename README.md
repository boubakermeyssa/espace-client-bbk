# Espace client BBK

Application de l'**Agence BBK** (communication 360° B2B, marques premium et luxe, Île-de-France) :
une landing page publique et un espace privé où chaque client consulte les documents déposés par l'agence
(briefs, visuels, factures, plannings).

**Stack :** Node.js + Express · `express-session` · pages HTML servies depuis `/public` · Tailwind via CDN · pas de framework front · pas de build.

## Arborescence

```
espace-client-bbk/
├── public/
│   ├── index.html          # Landing page (/)
│   ├── login.html          # Formulaire de connexion (/login)
│   ├── espace-client.html  # Espace client privé (/espace-client)
│   └── test-documents.html # Tableau de test d'administration des documents (/test-documents)
├── server.js               # Serveur Express & API REST
├── package.json
└── README.md
```

## Installation

Prérequis : Node.js 18 ou plus.

```bash
npm install
```

Les variables suivantes peuvent être définies dans l'environnement (ou dans les Secrets Replit) :

- `AIRTABLE_TOKEN` : token d'accès à l'API Airtable
- `AIRTABLE_BASE_ID` : identifiant de la base Airtable
- `SESSION_SECRET` : clé de chiffrement des cookies de session

*Note : Si les clés Airtable ne sont pas configurées en local, le serveur active automatiquement le mode démonstration pour vous permettre de tester la connexion et l'espace client sans aucune configuration.*

## Lancement

```bash
npm start
```

Puis ouvrir http://localhost:3000 (ou le port défini dans la variable `PORT`).

### Identifiants de test (mode démo sans Airtable) :
- **Email :** `demo@agence-bbk.fr`
- **Code :** `bbk2026`

ou

- **Email :** `client@maison-luxe.fr`
- **Code :** `luxe2026`

## Feuille de route

| Lot | Contenu | Statut |
|-----|---------|--------|
| **Lot 1** | Serveur Express, landing page, page de connexion (sans logique) | ✅ Livré |
| **Lot 2** | Base Airtable (tables Clients et Documents), API serveur et page de test des documents | ✅ Livré |
| **Lot 3** | Authentification email + code d'accès, sessions Express (`SESSION_SECRET`), déconnexion | ✅ Livré |
| **Lot 4** | Espace client : consultation des documents du client connecté, recherche, filtres par type, tri et téléchargements | ✅ Livré |
| **Lot 5** | Back-office agence : dépôt de documents et gestion des accès clients | À venir |
| **Lot 6** | Mise en ligne (hébergement, variables d'environnement, nom de domaine) | À venir |

## À personnaliser

- L'adresse `contact@agence-bbk.fr` dans `index.html`, `login.html` et `espace-client.html` est provisoire : la remplacer par l'adresse réelle de l'agence.

