# Contact form delivery

`POST /api/contact` validates and sanitizes the form, rejects bodies over 16 KiB, applies a best-effort in-memory limit of five requests per IP per ten minutes, and sends valid submissions to a server-side webhook. The application does not log message bodies.

Configure these server-only environment variables in the deployment:

- `CONTACT_WEBHOOK_URL` (required): HTTPS endpoint owned by the selected email/CRM delivery provider.
- `CONTACT_WEBHOOK_TOKEN` (recommended): bearer token sent in the `Authorization` header.

The webhook receives `name`, `email`, `project`, `service`, `timeline`, `message`, `source`, and `submittedAt` as JSON. It must return a 2xx response only after it has accepted the delivery. Missing configuration returns a safe `503`; provider rejection or timeout returns `502`, and the browser preserves the entered values.

Production notes:

- Keep both values outside the repository and never prefix them with `NEXT_PUBLIC_`.
- Configure provider-side rate limiting and abuse monitoring as the durable layer; the application limit is per running instance.
- Do not log the webhook body or copy message contents into analytics/error tracking.
- Verify keyboard and screen-reader behavior manually before enabling real delivery. Automated checks do not claim that manual verification was performed.
