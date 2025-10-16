# Changements effectués :
## Création de fichiers et dossiers: 
certbot
DB_DATA
nginx
nginx\nginx.conf
public\IMG_DATA
src\app\api\chat
src\app\api\chat\[id_chat]
src\app\api\chat\[id_chat]\route.ts
src\app\api\chat\start
src\app\api\chat\start\route.ts
src\app\api\chat\route.ts
src\app\api\confirm
src\app\api\confirm\route.ts
src\app\api\dashboard
src\app\api\dashboard\route.ts
src\app\api\list
src\app\api\list\perId
src\app\api\list\perId\route.ts
src\app\api\list\route.ts
src\app\api\login
src\app\api\login\route.ts
src\app\api\logout
src\app\api\logout\route.ts
src\app\api\me
src\app\api\me\route.ts
src\app\api\messagerie
src\app\api\messagerie\upload
src\app\api\messagerie\upload\route.ts
src\app\api\messagerie\route.ts
src\app\api\reinit-confirm
src\app\api\reinit-confirm\route.ts
src\app\api\reinit-password
src\app\api\reinit-password\route.ts
src\app\api\resendmail
src\app\api\resendmail\route.ts
src\app\api\signup
src\app\api\signup\route.ts
src\app\api\route.ts
src\app\chat
src\app\chat\[id_chat]
src\app\chat\[id_chat]\page.tsx
src\app\confirm
src\app\confirm\page.tsx
src\app\dashboard
src\app\dashboard\[user_id]
src\app\dashboard\[user_id]\page.tsx
src\app\list
src\app\list\[id_user]
src\app\list\[id_user]\page.tsx
src\app\list\page.tsx
src\app\login
src\app\login\page.tsx
src\app\logout
src\app\logout\page.tsx
src\app\messagerie
src\app\messagerie\page.tsx
src\app\reinit
src\app\reinit\page.tsx
src\app\signup
src\app\signup\page.tsx
src\lib
src\lib\db.ts
src\lib\mailer.ts
src\lib\reinit.ts
src\lib\resendmail.ts
UPLOADED_FILES
.dockerignore
docker-compose.yml
Dockerfile.nextjs
readme_changement.md

## Modifications de fichiers et dossiers:
src\app\page.tsx
.env
package.json
README.md

### Modification package.json (écoute partout et pas seulement local) : 
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
