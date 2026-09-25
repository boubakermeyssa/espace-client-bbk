# Guide de Mise en Ligne — Espace Client Agence BBK (Lot 6)

Ce guide décrit la procédure pas-à-pas pour mettre en ligne l'application **Espace Client BBK** en environnement de production avec un nom de domaine personnalisé et un certificat SSL HTTPS sécurisé.

---

## 📋 1. Liste des Variables d'Environnement en Production

Avant tout déploiement, configurez les variables suivantes dans le panneau d'administration de votre hébergeur :

| Variable | Description | Exemple / Valeur |
|----------|-------------|------------------|
| `NODE_ENV` | Mode d'exécution Node.js | `production` |
| `PORT` | Port d'écoute du serveur | `3000` (ou géré par l'hébergeur) |
| `SESSION_SECRET` | Clé secrète de chiffrement des cookies | `une_cle_secrete_aleatoire_32_caracteres` |
| `AIRTABLE_TOKEN` | Token d'accès Personal Access Token Airtable | `patXXXXXXXXXXXXXX...` |
| `AIRTABLE_BASE_ID` | Identifiant de la base Airtable | `appXXXXXXXXXXXXXX` |
| `ADMIN_EMAIL` | Email administrateur du back-office agence | `contact@agence-bbk.fr` |
| `ADMIN_PASSWORD` | Mot de passe administrateur du back-office | `MotDePasseSecurise2026!` |

---

## 🚀 2. Option A : Déploiement sur Render.com (Recommandé)

Render propose un hébergement Node.js clé en main avec **certificat SSL HTTPS automatique** et gestion simplifiée des noms de domaine.

### Étapes :
1. Créez un compte sur [Render.com](https://render.com).
2. Cliquez sur **New +** > **Web Service**.
3. Connectez votre compte GitHub et sélectionnez le dépôt `espace-client-bbk`.
4. Renseignez les paramètres suivants :
   - **Name** : `espace-client-bbk`
   - **Environment** : `Node`
   - **Build Command** : `npm install`
   - **Start Command** : `npm start`
5. Dans l'onglet **Environment Variables**, ajoutez les clés ci-dessus (`AIRTABLE_TOKEN`, `SESSION_SECRET`, `ADMIN_PASSWORD`, etc.).
6. Cliquez sur **Create Web Service**. L'application est immédiatement en ligne sous une URL du type `https://espace-client-bbk.onrender.com`.

---

## ⚡ 3. Option B : Déploiement sur Replit Deployments

Si vous utilisez Replit :

1. Ouvrez le projet sur Replit.
2. Dans le menu de gauche, ouvrez l'outil **Secrets** (l'icône de cadenas).
3. Ajoutez vos variables de production (`AIRTABLE_TOKEN`, `AIRTABLE_BASE_ID`, `SESSION_SECRET`, etc.).
4. Cliquez sur le bouton **Deploy** en haut à droite.
5. Choisissez **Autoscale** ou **Reserved VM**.
6. Suivez les étapes de confirmation. Votre application sera déployée et surveillée automatiquement.

---

## 🖥️ 4. Option C : Déploiement sur serveur VPS (Ubuntu + Nginx + PM2)

Pour héberger l'application sur votre propre serveur dédié ou VPS (OVH, Scaleway, DigitalOcean) :

### 1. Installation de Node.js et PM2
```bash
sudo apt update && sudo apt install -y nodejs npm nginx
sudo npm install -g pm2
```

### 2. Clonage et installation du projet
```bash
git clone https://github.com/boubakermeyssa/espace-client-bbk.git /var/www/espace-client-bbk
cd /var/www/espace-client-bbk
npm install --production
```

### 3. Fichier de configuration `.env`
Créez le fichier `/var/www/espace-client-bbk/.env` avec vos variables de production.

### 4. Lancement avec PM2
```bash
NODE_ENV=production pm2 start server.js --name "espace-client-bbk"
pm2 save
pm2 startup
```

### 5. Configuration Nginx Reverse Proxy (`/etc/nginx/sites-available/espace-client`)
```nginx
server {
    server_name client.agence-bbk.fr;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Activez le site et rechargez Nginx :
```bash
sudo ln -s /etc/nginx/sites-available/espace-client /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 6. SSL gratuit avec Let's Encrypt / Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d client.agence-bbk.fr
```

---

## 🌐 5. Association du Nom de Domaine Personnalisé (`client.agence-bbk.fr`)

Pour associer un sous-domaine de l'agence (ex: `client.agence-bbk.fr` ou `espace.agence-bbk.fr`) :

1. Connectez-vous chez votre registrar DNS (OVH, Cloudflare, Gandi, GoDaddy).
2. Ajoutez un enregistrement **CNAME** :
   - **Nom / Hôte** : `client` (ou `espace`)
   - **Cible / Valeur** : `espace-client-bbk.onrender.com` (ou l'adresse IP A de votre VPS)
   - **TTL** : Automatique ou 3600
3. Sur votre panneau d'hébergement (Render/Replit), allez dans **Custom Domains** et saisissez `client.agence-bbk.fr`.
4. L'hébergeur validera les DNS et émettra automatiquement le certificat SSL HTTPS sous quelques minutes.

---

## 🧪 6. Vérification de la Production

Une fois le serveur en ligne :
* Vérifiez la route de santé : `https://client.agence-bbk.fr/health` (doit renvoyer `{"status":"ok"}`)
* Vérifiez la connexion client sur `/login` avec vos identifiants Airtable.
* Vérifiez la connexion admin sur `/admin/login` avec votre `ADMIN_PASSWORD`.
