# Espace client BBK

Application de l'**Agence BBK** (communication 360° B2B, marques premium et luxe, Île-de-France) :
une landing page publique et un espace privé où chaque client consulte les documents déposés par l'agence
(briefs, visuels, factures, plannings).

**Stack :** Node.js + Express · pages HTML servies depuis `/public` · Tailwind via CDN · pas de framework front · pas de build.

## Arborescence

```
espace-client-bbk/
├── public/
│   ├── index.html      # Landing page (/)
│   └── login.html      # Formulaire de connexion (/login)
│   └── test-documents.html # Tableau de test des documents (/test-documents)
├── server.js           # Serveur Express
├── package.json
└── README.md
```

## Installation

Prérequis : Node.js 18 ou plus.

```bash
npm install
```

Les variables suivantes doivent être définies dans l'environnement (elles sont déjà configurées dans les Secrets Replit) :

- `AIRTABLE_TOKEN` : token d'accès à l'API Airtable
- `AIRTABLE_BASE_ID` : identifiant de la base Airtable
- `SESSION_SECRET` : réservé au Lot 3

## Lancement

```bash
npm start
```

Puis ouvrir http://localhost:3000 (ou le port défini dans la variable `PORT`).

Pour tester la lecture Airtable, ouvrir `/test-documents`. L'API serveur correspondante est disponible sur `/api/documents`.

## Feuille de route

| Lot | Contenu | Statut |
|-----|---------|--------|
| **Lot 1** | Serveur Express, landing page, page de connexion (sans logique) | ✅ Livré |
| **Lot 2** | Base Airtable (tables Clients et Documents), API serveur et page de test des documents | ✅ Livré |
| **Lot 3** | Authentification email + code d'accès, sessions (`SESSION_SECRET`), déconnexion | À venir |
| **Lot 4** | Espace client : liste des documents du client connecté (nom, date, type), filtres et téléchargement | À venir |
| **Lot 5** | Back-office agence : dépôt de documents et gestion des accès clients | À venir |
| **Lot 6** | Mise en ligne (hébergement, variables d'environnement, nom de domaine) | À venir |

## À personnaliser

- L'adresse `contact@agence-bbk.fr` dans `index.html` et `login.html` est provisoire : la remplacer par l'adresse réelle de l'agence.
