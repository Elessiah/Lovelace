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