# NEUCC Web App

Official website for the Netrokona University Computer Club.

## Recent bug fixes resolved

The following issues were fixed in the current workspace:

- removed leftover Git merge conflict markers in the frontend components
- corrected the contest type mismatch between data and TypeScript types
- normalized contest and committee date handling for build-time prerendering
- guarded missing committee member arrays during static page generation
- added safe fallback data so the app can render without a live database connection
- updated Next.js image configuration to allow Unsplash-hosted gallery images

## Local development

1. Copy [.env.example](.env.example) to `.env.local` and fill in the values.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Generate Prisma client and apply migrations:
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```
4. Start the app:
   ```bash
   npm run dev
   ```

## Testing and quality checks

```bash
npm run lint
npm run test
npm run build
```

## Deployment checklist

### Neon or Supabase

- Create a Postgres database.
- Copy the pooled URL into `DATABASE_URL`.
- Copy the direct connection URL into `DIRECT_URL`.
- Ensure SSL is enabled for remote Postgres providers.

### Vercel

Set these environment variables in Vercel project settings:

- `DATABASE_URL`
- `DIRECT_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_ACCESS_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`
- `NEXT_PUBLIC_APP_URL`

Then deploy the repo and verify that the build and Prisma migration steps succeed.

## CI pipeline

The GitHub Actions workflow runs the full validation flow:

- `npm ci`
- `npx prisma generate`
- `npx prisma migrate deploy`
- `npm run lint`
- `npm run test`
- `npm run build`
