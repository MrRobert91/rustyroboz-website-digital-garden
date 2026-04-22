# rustyroboz-website-digital-garden

Web personal con portfolio, artículos, digital garden y AI Lab. El frontend (`apps/web`) y el backend (`apps/api`) viven en el mismo repositorio, pero se construyen y despliegan por separado.

## Stack

- `apps/web`: Next.js + Tailwind + shadcn/ui-style components + Motion + MDX
- `apps/api`: FastAPI + SQLite + FAISS
- `content/`: contenido MDX versionado en el repo
- `docker-compose.yml`: solo para integración local

## Desarrollo

```bash
npm install
npm run test:web
python -m pip install -r apps/api/requirements.txt
python -m pytest apps/api/tests
```

## Docker

```bash
docker build -f apps/web/Dockerfile .
docker build -f apps/api/Dockerfile .
docker compose up -d --build
```
