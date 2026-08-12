# Repository content rules

- Every published file added under `content/projects/` must have exactly one matching entry in `apps/web/lib/timeline.ts`. The timeline entry must link to `/projects/<slug>` and use `kind: "project"` or `kind: "experiment"` consistently with the content frontmatter (missing `type` means `experiment`). Run the web tests; they enforce this invariant.
- Every published project or article change must ship with an API redeploy or restart so the content bundled by `apps/api/Dockerfile` reaches the chatbot. The API compares content checksums at startup and rebuilds SQLite, FTS and FAISS when they change. Run `python -m pytest apps/api/tests`, including the index-invalidation and retrieval evaluations, before delivery.
