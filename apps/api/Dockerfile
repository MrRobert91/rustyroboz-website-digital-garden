FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV HOST=0.0.0.0
ENV PORT=8000
ENV SQLITE_PATH=/data/site.db
ENV FAISS_INDEX_PATH=/data/faiss.index
ENV FAISS_META_PATH=/data/index_meta.json
# Bind the port immediately and build the FAISS index in a background thread,
# so platform healthchecks pass while the embedding model warms up.
ENV INDEX_STARTUP_MODE=background

WORKDIR /app

COPY apps/api/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Pre-bake the embedding model into the image so cold starts never download
# from HuggingFace at runtime (keep in sync with EMBEDDING_MODEL default).
RUN python -c "from fastembed import TextEmbedding; TextEmbedding(model_name='sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2')"

COPY apps/api/app ./app
COPY apps/api/.env.example ./.env.example
COPY content ./content

RUN mkdir -p /data

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
