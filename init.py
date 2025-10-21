import os

content_env = """
MYSQL_HOST=""              
MYSQL_ROOT_PASSWORD=""    
MYSQL_DATABASE=""          
MYSQL_USER=""             
MYSQL_PASSWORD=""          

SMTP_HOST=""              
SMTP_PORT=""               
SMTP_USER=""                
SMTP_PASS=""                
NEXT_PUBLIC_URL=""          

JWT_SECRET=""               
"""

content_next_env_d = """
/// <reference types="next" />
/// <reference types="next/image-types/global" />
/// <reference path="./.next/types/routes.d.ts" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.
"""
content_nginx_conf = """
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

        client_max_body_size 50M;  # autorise jusqu'à 50 Mo d'upload 

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
"""

def init_files():
    if not os.path.exists("UPLOADED_FILES"):
        os.makedirs("UPLOADED_FILES")
        print("Folder UPLOADED_FILES created")
    else:
        print("Folder UPLOADED_FILES already exist")

    if not os.path.exists("public/IMG_DATA"):
        os.makedirs("public/IMG_DATA")
        print("Folder public/IMG_DATA created")
    else:
        print("Folder public/IMG_DATA already exist")

    if not os.path.exists("nginx"):
        os.makedirs("nginx")
        print("Folder nginx created")
    else:
        print("Folder nginx already exist")

    if not os.path.exists("certbot"):
        os.makedirs("certbot")
        print("Folder certbot created")
    else:
        print("Folder certbot already exist")

    if not os.path.exists("certbot"):
        os.makedirs("certbot")
        print("Folder certbot created")
    else:
        print("Folder certbot already exist")

    if os.path.exists(".env"):
        print("Env file already exist")
    else:
        with open(".env", "w", encoding="utf-8") as f:
            f.write(content_env)
        print("Env file created")

    if os.path.exists("next-env.d.ts"):
        print("Next Env file already exist")
    else:
        with open("next-env.d.ts", "w", encoding="utf-8") as f:
            f.write(content_next_env_d)
        print("Next Env file created")

    if os.path.exists("nginx/nginx.conf"):
        print("Nginx config file already exist")
    else:
        with open("nginx/nginx.conf", "w", encoding="utf-8") as f:
            f.write(content_nginx_conf)
        print("Nginx config file created")

init_files()



