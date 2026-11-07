# Security

## Reporting a vulnerability

Please **do not** open a public issue for security problems. Use GitHub's *Security → Report a vulnerability* (private advisory) on this repository. You'll get a response as soon as possible.

## Known limitations

- **No authentication.** The app is single-tenant; every route is open to anyone who can reach the deployment. Protect it at the network/proxy layer or add auth before exposing it publicly.
- `POST /api/publish/run` is protected only if `CRON_SECRET` is set.
- OAuth access/refresh tokens are stored in Appwrite (encrypted columns). Use an Appwrite API key scoped to just this project.
- The storage bucket must be publicly readable for Instagram to fetch videos; files are deleted after publishing.

## If you leak a key

Rotate it at the provider (Appwrite, Groq, Google Cloud, Meta, Gemini) right away, then update your env files.
