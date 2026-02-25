# GH Secrets

A better UI for managing GitHub Actions secrets. Search, bulk-edit, copy across repos — all from one place.

## Stack

- TanStack Start / Router / Query
- React 19
- Tailwind CSS v4
- PostgreSQL (raw `pg`, no ORM)
- libsodium (secret encryption)

## Setup

```bash
npm install
```

Create a `.env.local`:

```
DATABASE_URL=postgresql://...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
ENCRYPTION_KEY=<64-char hex string>
```

Push the schema:

```bash
psql $DATABASE_URL -f migrations/001_auth.sql
```

Run:

```bash
npm run dev
```

## License

MIT
