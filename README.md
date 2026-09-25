# Espace client BBK

Application de l'**Agence BBK** (communication 360° B2B, marques premium et luxe, Île-de-France) :
une landing page publique, un espace privé où chaque client consulte ses documents et un Back-Office agence pour créer les accès et déposer des livrables.

**Stack :** Node.js + Express · `express-session` · pages HTML servies depuis `/public` · Tailwind via CDN · pas de framework front · pas de build.

## Arborescence

```
espace-client-bbk/
├── public/
│   ├── index.html          # Landing page (/)
│   ├── login.html          # Connexion client (/login)
│   ├── espace-client.html  # Espace client privé (/espace-client)
│   ├── admin-login.html    # Connexion administrateur agence (/admin/login)
│   ├── backoffice.html     # Back-Office agence (/backoffice)
│   └── test-documents.html # Tableau de test d'administration (/test-documents)
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
- `ADMIN_EMAIL` : email de connexion au back-office agence (par défaut `admin@agence-bbk.fr`)
- `ADMIN_PASSWORD` : mot de passe back-office (par défaut `bbk_admin_2026`)

*Note : Si les clés Airtable ne sont pas configurées en local, le serveur active automatiquement le mode démonstration pour vous permettre de tester la connexion, l'espace client et le back-office sans aucune configuration.*

## Lancement

```bash
npm start
```

Puis ouvrir http://localhost:3000 (ou le port défini dans la variable `PORT`).

### Identifiants de test Client :
- **Email :** `demo@agence-bbk.fr`
- **Code :** `bbk2026`

### Identifiants Back-Office Agence (Lot 5) :
- **URL :** `/admin/login` (ou `/backoffice`)
- **Email :** `admin@agence-bbk.fr`
- **Mot de passe :** `bbk_admin_2026`

## Feuille de route

| Lot | Contenu | Statut |
|-----|---------|--------|
| **Lot 1** | Serveur Express, landing page, page de connexion (sans logique) | ✅ Livré |
| **Lot 2** | Base Airtable (tables Clients et Documents), API serveur et page de test des documents | ✅ Livré |
| **Lot 3** | Authentification email + code d'accès, sessions Express (`SESSION_SECRET`), déconnexion | ✅ Livré |
| **Lot 4** | Espace client : consultation des documents du client connecté, recherche, filtres par type, tri et téléchargements | ✅ Livré |
| **Lot 5** | Back-office agence : dépôt de documents et gestion des accès clients | ✅ Livré |
| **Lot 6** | Mise en ligne (hébergement, variables d'environnement, nom de domaine) | À venir |

## À personnaliser

- L'adresse `contact@agence-bbk.fr` dans les pages HTML est provisoire : la remplacer par l'adresse réelle de l'agence.


