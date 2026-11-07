# Contributing

Thanks for helping! This is a small project, so the process is light.

## Ground rules

- **Never commit secrets.** `.env*`, `client_secret*.json` and token files are git-ignored — keep it that way. If you accidentally push a key, rotate it immediately; deleting the commit is not enough.
- Open an issue before large changes so we can agree on the approach.
- One focused change per pull request.

## Setup

Follow *Getting started* in the [README](README.md). You need your own Appwrite project and API keys; there is no shared test backend.

## Code conventions

The frontend follows clean architecture — keep the dependency direction `presentation → application → domain ← infrastructure`:

- `domain/` has no framework or SDK imports.
- Appwrite, Groq and platform APIs live only in `infrastructure/`.
- New behaviour = a use case in `application/` + a repository/publisher in `infrastructure/`.

Before opening a PR:

```bash
cd frontend
npm run typecheck
npm run lint
```

## Good first issues

- TikTok publisher (`infrastructure/publish/`) once API access is available
- Authentication / multi-tenant accounts
- Tests for the scheduling policies in `domain/policies/`
- Additional platforms

## Reporting security problems

Please don't open a public issue — see [SECURITY.md](SECURITY.md).
