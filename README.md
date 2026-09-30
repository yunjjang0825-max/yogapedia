# Yogapedia ClassBox

Mobile-first operations app for validating the Busan 4060 Movement Recovery ClassBox. It covers public recruitment, magic-link authentication, participant check-ins, instructor attendance, and aggregate organization outcomes.

## Local development

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

## Quality gates

```bash
pnpm run lint
pnpm run typecheck
pnpm test -- --run
pnpm run build
pnpm exec playwright test
pnpm exec supabase test db
```

Database migrations and pgTAP policies live in `supabase/`. Deployment and pilot procedures live in `docs/operations/`.
