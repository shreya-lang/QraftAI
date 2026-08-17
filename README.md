# Adaptive Problem Generator — Deployment Guide

This repository contains a FastAPI backend and a Next.js frontend. Below are steps to initialize a Git repository, push to GitHub, and deploy to common hosting providers.

1) Initialize Git and push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
# create a GitHub repo, then
git remote add origin https://github.com/<your-username>/<repo>.git
git branch -M main
git push -u origin main
```

2) Use Vercel for the frontend (recommended)

- Create a Vercel account and connect your GitHub repository.
- Set `NEXT_PUBLIC_API_URL` in Vercel Environment Variables to your backend URL (e.g., https://your-backend.example.com).

3) Deploy the backend

Option A — Render (simple):
- Create a new Web Service on Render, connect the GitHub repo.
- Set the `Start Command` to: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
- Set environment variables for `FIREBASE_CREDENTIAL_PATH` and `GROQ_API_KEY` if needed, and add the `serviceAccountKey.json` content as a secure file if required.

Option B — Docker (self-host):
- Build the backend image:

```bash
docker build -t adaptive-backend -f backend/Dockerfile .
docker run -p 8000:8000 adaptive-backend
```

4) GitHub Actions CI

The repository includes a basic GitHub Actions workflow at `.github/workflows/ci.yml` which installs dependencies and builds the frontend on PRs and pushes to `main`.

5) Notes and secrets

- Do NOT commit `serviceAccountKey.json` or other secrets. Add them to your hosting provider's secret storage.
- If you want automatic Docker image publishing, add a workflow step to push to GitHub Packages or Docker Hub and provide credentials as secrets.

If you want, I can: create a GitHub repo for you (requires your GitHub token), push the code, or set up a GitHub Actions workflow to publish Docker images — tell me which and I'll proceed.
