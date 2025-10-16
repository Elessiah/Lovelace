# Lovelace

## Installation du projet

# 1. Installation de Node.js
# Windows / Mac : téléchargez et installez depuis https://nodejs.org/
# Linux (Debian/Ubuntu) :
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Vérification
node -v
npm -v

# 2. Installation de Docker
# Windows / Mac : téléchargez et installez Docker Desktop : https://www.docker.com/products/docker-desktop
# Linux (Debian/Ubuntu) :
sudo apt-get update
sudo apt-get install -y docker.io
sudo systemctl start docker
sudo systemctl enable docker

# Vérification
docker --version
docker-compose --version

# 3. Cloner le repository (il faut avoir accès au repo privé):
git clone https://github.com/USERNAME/REPO.git
cd REPO

# 4. Lancer le projet avec Docker
docker compose up -d

## Challenge Positive Future : Projet Lovelace

Les métiers scientifiques souffrent d’un manque de modèles féminins visibles, ce qui limite l’inspiration des jeunes filles. Pourtant, ces figures existent, mais elles restent trop souvent invisibles. Notre plateforme leur redonne toute leur place en valorisant leurs parcours et en créant des espaces d’échange directs avec la jeunesse. L’objectif est simple : susciter des vocations et ouvrir des horizons en rendant accessibles des profils inspirants, variés et proches des réalités actuelles. Avec une navigation rapide et intuitive, nous adaptons la découverte de ces modèles aux nouvelles générations, pour les aider à trouver leur voie dès l’orientation.

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
