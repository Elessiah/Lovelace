# à faire:
changer variables env si besoin 

## tuto readme (secondaire)
installation node
installation docker
clone repo

## packages
npm install mysql2
npm install bcrypt
npm install bcryptjs
npm install nodemailer
npm install jsonwebtoken
npm install formidable
npm install formidable-serverless

à rajouter dans package json si besoin la dépendance 

## tests secu et utilisation 

## dynamic route
ROUTING dynamique (exemple récupérer un truc en fonction de l'utilisateur connecté):
/app/user/[username]

# Changements effectués :

Création readme_changement.md
Création docker-compose.yml
Création Dockerfile.nextjs
Création dossier nginx avec le fichier nginx.conf
Création dossier certbot
Création .dockerignore
Création dossier DB_DATA
Création fichier .env
Création dossiers dashboard_amba, dashboard_user, login, signup, chat, user, [id_user], logout, confirm
Création dossier api (pour la DB) avec les sous dossiers
Création fichiers route.ts et page.tsx dans les dossiers
Création dossier lib pour la DB et MAILER
Création dossier /public/IMG_DATA pour stockage pp

# Modification package.json (écoute partout et pas seulement local) : 
"scripts": {
    "dev": "next dev --turbopack",
    "build": "next build --turbopack",
    "start": "next start -p 9000 -H 0.0.0.0", <--- ICI 
    "lint": "eslint"
  },

# Autres
## commandes
npm run build
npm run dev
docker compose up --build
docker compose up -d
docker compose down

Cmd rebuild all except certbot:
docker compose up -d --build nextjs nginx mysql phpmyadmin

Cmd build nextjs:
docker compose build nextjs

Commandes renouvellement certificat (nécessite nginx conf http only):
docker compose down
docker compose up -d nginx nextjs
docker compose run --rm certbot

## configs
Ancienne config locale nginx-to-next qui était OK si besoin (partie location):

          location / {
            proxy_pass http://nextjs:9000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

Config Actuelle:

events {
    worker_connections  1024;
}

http {
    server_tokens off;
    charset utf-8;

    # always redirect to https
    server {
        listen 80 default_server;

        server_name _;

        return 301 https://$host$request_uri;
    }

    server {
        listen 443 ssl http2;

        ssl_certificate /etc/letsencrypt/live/love-lace.fr/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/love-lace.fr/privkey.pem;

        server_name love-lace.fr www.love-lace.fr;

        location / {
            proxy_pass http://nextjs:9000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        location ~ /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }
    }
}

Config HTTP ONLY:
events {
    worker_connections 1024;
}

http {
    server_tokens off;
    charset utf-8;

    # Serveur HTTP (pour Certbot)
    server {
        listen 80;
        server_name love-lace.fr www.love-lace.fr;

        # Permet à Let's Encrypt d'accéder à la validation
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        # Proxy vers Next.js
        location / {
            proxy_pass http://nextjs:9000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
