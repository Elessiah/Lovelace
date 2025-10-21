# Challenge Positive Future : Projet Lovelace

Les métiers scientifiques souffrent d’un manque de modèles féminins visibles, ce qui limite l’inspiration des jeunes filles. Pourtant, ces figures existent, mais elles restent trop souvent invisibles. Notre plateforme leur redonne toute leur place en valorisant leurs parcours et en créant des espaces d’échange directs avec la jeunesse. L’objectif est simple : susciter des vocations et ouvrir des horizons en rendant accessibles des profils inspirants, variés et proches des réalités actuelles. Avec une navigation rapide et intuitive, nous adaptons la découverte de ces modèles aux nouvelles générations, pour les aider à trouver leur voie dès l’orientation.

## Installation du projet

### 1. Installation de Node.js
### Windows / Mac : téléchargez et installez depuis https://nodejs.org/
### Linux (Debian/Ubuntu) :
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

### Vérification
node -v
npm -v

### 2. Installation de Docker
### Windows / Mac : téléchargez et installez Docker Desktop : https://www.docker.com/products/docker-desktop
### Linux (Debian/Ubuntu) :
sudo apt-get update
sudo apt-get install -y docker.io
sudo systemctl start docker
sudo systemctl enable docker
 
### Vérification
docker --version
docker-compose --version

### 3. Installation de Python

### Windows / Mac
Téléchargez et installez Python depuis le site officiel : [https://www.python.org/downloads/](https://www.python.org/downloads/)  
Lors de l’installation, cochez **"Add Python to PATH"** pour pouvoir utiliser Python depuis le terminal.
### Linux (Debian/Ubuntu)
sudo apt-get update
sudo apt-get install -y python3 python3-pip

### Vérification
python3 --version
pip3 --version

### 4. Cloner le repository (il faut avoir accès au repo privé):
git clone https://github.com/USERNAME/REPO.git
cd REPO

### 5. Lancer le projet
- Lancer le fichier init.py pour initialiser les fichiers et dossiers nécessaires

- Changer les paramètres du fichier local ".env" dans le dossier du repository avec ces paramètres:
    MYSQL_HOST=""               <--- nom du container mysql
    MYSQL_ROOT_PASSWORD=""      <--- mdp root mysql (le pseudo est tjr root)
    MYSQL_DATABASE=""           <--- nom database mysql
    MYSQL_USER=""               <--- user mysql
    MYSQL_PASSWORD=""           <--- mdp user mysql

    SMTP_HOST=""                <--- serveur d'envoi mail
    SMTP_PORT=""                <--- port du serveur d'envoi mail
    SMTP_USER=""                <--- mail
    SMTP_PASS=""                <--- mdp mail
    NEXT_PUBLIC_URL=""          <--- lien du domaine 

    JWT_SECRET=""               <--- token de vérification JWT 

- npm install
- npm run build
- docker compose build
- docker compose up -d nginx
- Première initialisation du certificat : "docker run --rm -v ./certbot/conf:/etc/letsencrypt -v ./certbot/www:/var/www/certbot certbot/certbot certonly --webroot -w /var/www/certbot -d love-lace.fr -d www.love-lace.fr --email admin@love-lace.fr --agree-tos --non-interactive"
- docker compose down
- Lancer initSSL.py
- docker compose build nginx
- docker compose up -d
- Pour initialiser la construction de la DB sur docker il faut aller sur le site et remplir un formulaire qui contient l'instance de la DB par exemple s'inscrire ou se connecter

