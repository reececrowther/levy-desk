# Levy Desk — CLAUDE.md

## What this project is

Levy Desk turns holiday-let bookings into correct, ready-to-file visitor levy returns for councils in Scotland and Wales. It imports bookings, applies the correct rule per council and date, flags bookings that need human review, and produces a return pack the host files themselves. It does **not** file or pay on the host's behalf.

## Correctness rules (non-negotiable)

- The rules engine (`src/levy/`) must be pure, deterministic functions with no database or network access.
- Never guess a rule. Where the law or guidance is ambiguous, surface it as an explicit config option with a conservative default and raise an exception flag on the booking.
- Every calculation stores its full working: rule version, nights charged, base amount, exclusions, cap applied, rate, levy, VAT on levy, retention.
- Rules are versioned by effective-from date. Changing a rule creates a new version; calculations in locked quarters never change.
- Money is handled in **integer pence**. Never use floating point for money. Rounding rule: half-up (round half away from zero), configurable per scheme.
- Each rule in `docs/RULES.md` must cite its source URL and be marked VERIFIED or UNVERIFIED.

## Commands

```bash
npm run dev          # start Next.js dev server
npm test             # run Vitest unit tests
npm run test:e2e     # run Playwright end-to-end tests
npm run build        # production build
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npx prisma migrate dev   # apply DB migrations
npx prisma db seed       # seed rule data
```

## Folder layout

```
levy-desk/
├── CLAUDE.md
├── docs/
│   ├── SPEC.md
│   ├── RULES.md
│   └── PHASES.md
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── levy/            # rules engine — zero framework imports
│   │   ├── types.ts
│   │   ├── calculator.ts
│   │   ├── rules/       # versioned rule data (TS or JSON)
│   │   └── __tests__/
│   ├── app/             # Next.js App Router
│   ├── components/
│   ├── lib/
│   └── server/          # Prisma client, auth, jobs
├── tests/               # Playwright e2e
└── vitest.config.ts
```

## Conventions

- TypeScript strict mode throughout.
- Zod validates all inputs and imports at system boundaries.
- `src/levy/` has no imports from Next.js, Prisma, or any other framework package.
- All UI text in British English.
- Money values in pence (integer) in code; formatted as GBP on display.
- Exception flags are strings from a typed enum (`src/levy/flags.ts`); never freeform.
- Scheme rules are versioned data, not hardcoded logic — a rule lookup by council + effective date picks the right version.
- Highland (fixed-rate proposed scheme) is disabled by default; a feature flag enables it.
- Keep `docs/RULES.md` and this file up to date as rules or structure change.
- Commit after each meaningful step with a clear message.
- Before committing: `npm test` green, `npm run typecheck` clean.
