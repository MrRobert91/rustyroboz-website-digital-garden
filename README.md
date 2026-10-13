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

## Publicar cambios de contenido

Al publicar proyectos o artículos, despliega tanto la web como la API desde el
mismo commit. `apps/api/Dockerfile` copia `content/` durante el build: reiniciar
una imagen antigua no incorpora los nuevos archivos. En Sliplane, redespliega el
servicio API con el commit publicado y comprueba `/health` hasta que
`storage.faiss` sea `ready`; al arrancar se comparan los checksums y se
actualizan SQLite, FTS y FAISS. En local, usa `docker compose up -d --build api web`.

Para esta incorporación, comprueba además que el chatbot recupera
`/projects/moloch-arena` y `/projects/metamorfosis` tras el despliegue.
