# Deployment Guide (Dokploy / VPS)

This guide covers how to deploy the Quant Alpha application to any VPS (like Google Cloud, AWS, DigitalOcean) using [Dokploy](https://dokploy.com/), a free and open-source self-hostable PaaS that simplifies Docker deployments.

## Why Dokploy?
Dokploy acts like a free Heroku/Vercel on your own VPS. It reads the provided `Dockerfile`, builds the application, sets up an isolated container, and configures Nginx and SSL certificates automatically.

## Step 1: Install Dokploy on your VPS

SSH into your fresh Ubuntu VPS and run the official Dokploy installation script:
```bash
curl -sSL https://dokploy.com/install.sh | sh
```
Once installed, navigate to your server's IP address on port `3000` (e.g., `http://YOUR_VPS_IP:3000`) to set up your Dokploy admin account.

## Step 2: Create a New Application

1. In the Dokploy Dashboard, go to **Projects** -> **Create Project** (e.g., "QuantAlpha").
2. Inside the project, click **Create Application**.
3. Link your GitHub repository.

## Step 3: Configure the Build

1. **Source Code**: Select the repository and the branch (e.g., `main`).
2. **Build Type**: Choose **Dockerfile**.
3. **Internal Port**: Set this to `3000`. This is the port the Express/Vite server runs on inside the container.

## Step 4: Environment Variables

If you have external API keys in your `.env.example`, navigate to the **Environment** tab in Dokploy and paste your real values.

```env
PORT=3000
```
*Note: Our `server.ts` automatically binds to `0.0.0.0` and listens to `process.env.PORT || 3000`, making it perfect for Dokploy.*

## Step 5: Domains and SSL

1. Point your domain (e.g., `alpha.yourdomain.com`) to your VPS IP address in your DNS settings (A Record).
2. In Dokploy, go to the **Domains** tab for your app.
3. Add `alpha.yourdomain.com` and click **Generate Let's Encrypt Certificate**. Dokploy handles the Nginx proxying gracefully.

## Step 6: Deploy

Go to the **Deployments** tab and click **Deploy**. Dokploy will pull the code, execute the multi-stage build defined in the `Dockerfile`, install dependencies automatically, and expose it to the web.

You can monitor real-time build logs directly through the Dokploy interface.

## Maintenance
Whenever you push changes to your GitHub branch, Dokploy can be set to auto-deploy the newest version, ensuring zero manual intervention!
