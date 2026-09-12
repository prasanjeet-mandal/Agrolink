# AgroLink — DevOps & Deployment

## Local Development (Docker)

1. Copy environment config:
   ```sh
   copy .env.example .env   # edit secrets first
   ```
2. Build & start the full stack:
   ```sh
   docker compose up -d --build
   ```
3. Services:
   - Frontend (React/nginx): `http://localhost`
   - Backend (Spring Boot): `http://localhost:8080`
   - AI service (FastAPI): `http://localhost:8000`
   - MySQL: `localhost:3306`

Stop/clean:
```sh
docker compose down
docker compose down -v   # also removes DB volume
```

## CI/CD Pipeline (GitHub Actions)

Workflow: `.github/workflows/deploy.yml`

| Stage  | Action |
|--------|--------|
| test   | Builds & tests frontend (npm), backend (Maven), AI service (pip) |
| docker | Builds & pushes images to GHCR (`ghcr.io/<repo>/agrolink-*`) on push to `main` |
| deploy | SSHes into the server, pulls images, `docker compose up -d` |

> Note: GitHub only picks up workflows inside a git repository root. If `AgroLink`
> is a subfolder of a larger repo, either make `AgroLink` its own repository or
> move `.github/workflows/deploy.yml` to the repo root.

## Required GitHub Secrets

| Secret               | Purpose                          |
|----------------------|----------------------------------|
| `DEPLOY_HOST`        | Server IP / domain               |
| `DEPLOY_USER`        | SSH username                     |
| `DEPLOY_SSH_KEY`     | SSH private key                  |
| `DEPLOY_PORT`        | SSH port (default 22)            |
| `DEPLOY_PATH`        | Project path on server (e.g. `/opt/agrolink`) |

GHCR auth uses the automatic `GITHUB_TOKEN` (push permission). No extra secret needed.

## Server Setup (one-time)

```sh
# install docker + compose plugin, then:
mkdir -p /opt/agrolink && cd /opt/agrolink
git clone <repo-url> .
cp .env.example .env && nano .env   # set production values

# set compose to pull ghcr images:
#   backend/frontend/ai-service: use
#   image: ghcr.io/<owner>/agrolink-<svc> instead of build
```

## Image Tags

- `latest` — pushed on every `main` push
- `sha-<commit>` — immutable per-commit tag for rollback