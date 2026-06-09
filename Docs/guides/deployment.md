# Deployment Guide

This guide covers step-by-step instructions for deploying the 3HD2Kcinema static web application to production. Since the application runs entirely in the browser, deployment involves hosting static files on a global Content Delivery Network (CDN) with zero backend setup.

---

## Supported Hosting Platforms

You can deploy the app to any static hosting provider. The recommended options are:
1. **GitHub Pages** (Free, simple integration with GitHub)
2. **Vercel** (Free, excellent edge performance)

---

## Option 1: Deploying to GitHub Pages

GitHub Pages serves static web files directly from your repository branch.

### Deployment Steps
1. **Repository Setup**: Commit all files (`index.html`, `login.html`, `js/`, `css/`, `Docs/`) and push them to your GitHub repository:
   ```bash
   git add .
   git commit -m "docs: deploy static app to github pages"
   git push origin main
   ```
2. **Configure Settings**:
   - Go to your repository page on GitHub.
   - Click on the **Settings** tab.
   - Select **Pages** from the left-hand navigation menu.
   - Under **Build and deployment**, set the source to **Deploy from a branch**.
   - Select the branch (e.g., `main`) and the directory (select `/root`).
   - Click **Save**.
3. **Access Site**: Within a few minutes, GitHub will build the page. Your site will be live at:
   `https://<your-github-username>.github.io/<repository-name>/`

---

## Option 2: Deploying to Vercel

Vercel detects static HTML repositories automatically and provides automated deploys on git push.

### Deployment Steps
1. Log into your account at [Vercel](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository.
4. **Configure Project**:
   - Vercel will auto-detect the repository as static.
   - Leave the **Build Command** empty/blank.
   - Leave the **Output Directory** as `./` (root).
5. Click **Deploy**. Vercel will provision a custom subdomain (e.g. `3hd2kcinema.vercel.app`) with SSL enabled automatically.

---

## Rollbacks & Continuous Integration

* **Continuous Deployment**: When you push new changes to your selected Git branch (e.g., `main`), both GitHub Pages and Vercel will automatically compile and distribute the new version of your files to their CDNs.
* **Rollback Procedure**: If a bug is deployed, you can roll back to a previous build instantly by selecting a previous deployment in the Vercel dashboard and clicking "Redeploy". For GitHub Pages, revert the commit on your main branch and push.
