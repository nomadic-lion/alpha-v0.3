# Deployment Guide (Google Cloud VPS)

This guide covers how to deploy the Quant Alpha application to a Google Cloud VPS (Compute Engine) running Linux (Ubuntu/Debian) using Docker.

We recommend Docker because it ensures that the app runs in the exact same environment as it does during development, preventing "it works on my machine" issues.

## Prerequisites

1.  A Google Cloud VPS (Compute Engine instance) accessible via SSH.
2.  Your instance should have ports `80` (HTTP) and `443` (HTTPS) open in the Google Cloud VPC firewall rules.
3.  A domain name pointing to your VPS IP address (optional but recommended).

## Step 1: Install Docker & Docker Compose on VPS

SSH into your Google Cloud VPS and run the following commands to install Docker:

```bash
# Update package list
sudo apt-get update

# Install prerequisites
sudo apt-get install ca-certificates curl gnupg

# Add Docker's official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Set up the repository
echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine and Docker Compose
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Verify installation
sudo docker --version
sudo docker compose version
```

## Step 2: Transfer Application Files

You will need to transfer your project source code to your VPS. You can do this by using Git, or `scp` / `rsync`.

If using Git:
```bash
git clone <your-repository-url>
cd <your-repository-directory>
```

## Step 3: Configure Environment Variables

The application requires an environment variable file (`.env`). Copy the example and edit anything if needed.

```bash
cp .env.example .env
```
*(Currently none are strictly required as we pull public data, but keep it available for future API keys.)*

## Step 4: Build and Run with Docker

This project includes a `Dockerfile` and `docker-compose.yml`. Docker will automatically figure out how to build the React application and Express server.

Build and start the container in detached mode (`-d`):

```bash
sudo docker compose up --build -d
```

Your app will now be running and exposed on port `3000`.

## Step 5: Set up a Reverse Proxy (Nginx)

On a production VPS, you rarely expose port 3000 directly. Instead, you use a reverse proxy like Nginx to securely handle port 80/443 and route traffic internally to port 3000.

1. Install Nginx:
```bash
sudo apt install nginx -y
```

2. Create an Nginx config file:
```bash
sudo nano /etc/nginx/sites-available/quantalpha
```

3. Paste the following configuration (replace `your_domain.com` with your actual domain or IP):
```nginx
server {
    listen 80;
    server_name your_domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

4. Enable the configuration and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/quantalpha /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Step 6: Secure with SSL (Let's Encrypt)

If you mapped a domain to your VPS:

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your_domain.com
```
Follow the prompts to enable HTTPS. Your app is now live, secure, and running!

## Maintenance Commands

**View Server Logs:**
```bash
sudo docker compose logs -f
```

**Restart the App:**
```bash
sudo docker compose restart
```

**Pull Updates and Rebuild:**
```bash
git pull origin main
sudo docker compose up --build -d
```
