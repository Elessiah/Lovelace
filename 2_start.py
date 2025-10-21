import subprocess
import os
import platform

def full_build():
    is_windows = platform.system() == "Windows"

    content_nginx_config_ssl = """events {
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

        client_max_body_size 50M;

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

    # Part 1 commands
    commands_part1 = [
        ["npm", "install"],
        ["npm", "run", "build"],
        ["docker", "compose", "build"],
        ["docker", "compose", "up", "-d", "nginx"],
        (
            'docker run --rm '
            '-v ./certbot/conf:/etc/letsencrypt '
            '-v ./certbot/www:/var/www/certbot '
            'certbot/certbot certonly --webroot -w /var/www/certbot '
            '-d love-lace.fr -d www.love-lace.fr '
            '--email admin@love-lace.fr --agree-tos --non-interactive'
        ),
        ["docker", "compose", "down"]
    ]

    # Run part 1
    for cmd in commands_part1:
        print(f"Running: {' '.join(cmd) if isinstance(cmd, list) else cmd}")
        subprocess.run(cmd, shell=is_windows)

    # Write/modify nginx config
    os.makedirs("nginx", exist_ok=True)
    with open("nginx/nginx.conf", "w", encoding="utf-8") as f:
        f.write(content_nginx_config_ssl)
    print("Nginx config file written")

    # Part 2 commands
    commands_part2 = [
        ["docker", "compose", "build", "nginx"],
        ["docker", "compose", "up", "-d"]
    ]

    # Run part 2
    for cmd in commands_part2:
        print(f"Running: {' '.join(cmd) if isinstance(cmd, list) else cmd}")
        subprocess.run(cmd, shell=is_windows)

# Execute the full build sequence
full_build()
