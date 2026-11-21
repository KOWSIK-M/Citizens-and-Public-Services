# ClaimSaathi demo catalog

Run the migration and both seeds in order using a Neon owner connection. Each file can be reapplied without replacing existing catalog edits.

```sh
psql "$NEON_OWNER_DATABASE_URL" -v ON_ERROR_STOP=1 -f database/migrations/001_schema_and_rls.sql
psql "$NEON_OWNER_DATABASE_URL" -v ON_ERROR_STOP=1 -f database/seeds/001_ap_schemes.sql
psql "$NEON_OWNER_DATABASE_URL" -v ON_ERROR_STOP=1 -f database/seeds/002_scheme_guidance.sql
```

Give the hosted function a dedicated Postgres login and set its pooled connection string as the server-side `DATABASE_URL` in Vercel. Grant that login `USAGE` on `public` and `SELECT` on `schemes`, `scheme_sources`, `scheme_rules`, `scheme_documents`, and `application_steps` only. Use the owner connection to apply migrations and maintain the catalog.

`GET /api/schemes` reports `data_source: "neon"` when the catalog loads from the database. `npm run dev` runs the local demo with fixtures and the local Admin Studio.
