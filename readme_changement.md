# Changements effectués :

Création readme_changement.md

Création docker-compose.yml
Création Dockerfile.nextjs
Création dossier nginx avec le fichier nginx.conf
Création dossier certbot
Création .dockerignore

Modification package.json (écoute partout et pas seulement local) : 
"scripts": {
    "dev": "next dev --turbopack",
    "build": "next build --turbopack",
    "start": "next start -p 9000 -H 0.0.0.0", <--- ICI 
    "lint": "eslint"
  },

# Autres

Commandes renouvellement certificat (nécessite nginx conf http only):
docker compose down
docker compose up -d nginx nextjs
docker compose run --rm certbot

Ancienne config locale nginx-to-next qui était OK si besoin:

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

(Config Actuelle):

        location / {
            proxy_pass http://nextjs:9000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

events {
    worker_connections 1024;
}


HTTP ONLY:
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
