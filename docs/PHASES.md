# Levy Desk — Phase Checklist

**Last updated:** 2026-10-16

Phases are sequential. Do not start a phase until the previous one is accepted.

---

## Phase 0 — Spec (COMPLETE)

### Deliverables
- [x] `CLAUDE.md` — project summary, correctness rules, commands, folder layout, conventions
- [x] `docs/SPEC.md` — product specification
- [x] `docs/RULES.md` — every scheme rule with source URL and VERIFIED/UNVERIFIED status
- [x] `docs/PHASES.md` — this file

### Acceptance criteria
- All four documents exist and are internally consistent.
- Every rule in RULES.md has a source URL.
- Questions and risks are listed for review.

---

## Phase 1 — Rules engine

### Deliverables
- [ ] `src/levy/types.ts` — TypeScript types: `Booking`, `Property`, `SchemeRule`, `Calculation`, `CalculationFlag`
- [ ] `src/levy/flags.ts` — typed enum of all exception flags
- [ ] `src/levy/calculator.ts` — pure `calculate()` function
- [ ] `src/levy/rules/` — versioned rule data (TypeScript or JSON) for all schemes; Highland disabled
- [ ] `src/levy/__tests__/` — all 15 worked examples as Vitest tests; additional edge-case tests
- [ ] `vitest.config.ts` — Vitest configuration
- [ ] `package.json` — project initialised with required dev dependencies

### Acceptance criteria
- `npm test` passes with all 15 worked examples and additional edge cases green.
- `npm run typecheck` passes with zero errors.
- `src/levy/` has no imports from Next.js, Prisma, or any other framework package.
- All money arithmetic uses integer pence; no floating-point arithmetic for money.
- Each calculation returns a `working` object showing every step.
- Rule versions are selected by council + effective date; the correct version is used for each stay.
- Highland rule exists in the data but is disabled and raises `HIGHLAND_PROPOSED` if somehow invoked.
- Edge cases covered: zero nights, same-day turnaround, leap-year February, stay crossing a rule version change, stay crossing a quarter boundary, maximum night cap exactly, maximum night cap plus one.

---

## Phase 2 — App skeleton

### Deliverables
- [ ] Next.js app initialised (App Router, TypeScript strict)
- [ ] Prisma schema matching the data model in SPEC.md
- [ ] Auth.js email magic-link authentication
- [ ] Account management (create, edit VAT status, plan)
- [ ] Property management (create, edit, postcode-to-council lookup)
- [ ] Postcode-to-council lookup using postcodes.io API, mapped to scheme slug, cached in DB
- [ ] Manual booking entry form (all Booking fields)
- [ ] Bookings table with levy amount column and "Show working" drawer
- [ ] Dashboard: levy owed this quarter per council, next deadline, count of flagged bookings
- [ ] Tailwind CSS + shadcn/ui component setup

### Acceptance criteria
- `npm run build` succeeds with no TypeScript errors.
- A new user can sign up, add a property, add a booking manually, and see the calculated levy.
- The "Show working" drawer displays every step of the calculation.
- Dashboard figures update when bookings are added or edited.
- Postcode lookup correctly maps Scottish and Welsh postcodes to the right council slug.
- No floating-point money in the UI layer (format from pence).

---

## Phase 3 — Imports

### Deliverables
- [ ] CSV and Excel upload endpoint and UI
- [ ] Column-mapping screen with save-per-source
- [ ] Preset mappings for Airbnb and Booking.com exports (user-editable)
- [ ] Row-level Zod validation with inline error display
- [ ] Deduplication by `source + externalRef + propertyId`
- [ ] Flagging of rows with missing guest count or gross amount
- [ ] pg-boss job queue for import processing

### Acceptance criteria
- An Airbnb CSV export can be uploaded without manual column mapping.
- A Booking.com CSV export raises `BOOKING_COM_DOUBLE_REMIT` on every Edinburgh booking.
- Duplicate rows (same source + externalRef) are silently skipped, not duplicated.
- Rows with validation errors are shown with a plain-English description of the error; valid rows in the same file are imported successfully.
- Missing guest count or gross flags the booking but does not prevent other bookings importing.

---

## Phase 4 — Exceptions and returns

### Deliverables
- [ ] Exceptions queue: list of all flagged bookings with plain-English reason and one-click fix form
- [ ] Quarterly return pack per council: totals and per-booking appendix
- [ ] Return pack downloadable as CSV and PDF
- [ ] Return layout matches the council's own return form
- [ ] Deadline calendar showing next return due dates
- [ ] Email reminders for upcoming deadlines (including nil returns)
- [ ] Return locking: locks all calculations in the period
- [ ] Amendment flow: editing a locked booking creates an amendment logged in AuditLog
- [ ] Audit log viewer (read-only table)

### Acceptance criteria
- Every flagged booking appears in the exceptions queue with a human-readable explanation.
- A fix applied via the one-click form clears the flag and recalculates.
- A return pack for Edinburgh Q3 2026 can be generated, downloaded as CSV and PDF, and the totals match a manual calculation.
- Locking a return prevents the underlying calculations from changing even if the booking is edited.
- Editing a locked booking's gross amount creates an audit entry and a new (unlocked) amendment calculation.
- A nil-return reminder email is generated for a council where the host has no stays in the quarter.

---

## Phase 5 — Billing and agents

### Deliverables
- [ ] Stripe integration (subscriptions, usage reporting)
- [ ] Plan enforcement: Free plan limited to 1 unit; upgrades via Stripe Checkout
- [ ] Agent workspace: client list, per-client property and booking management
- [ ] Per-client return packs
- [ ] Owner statements with levy disbursement line
- [ ] Accountant invite (read-only access via Auth.js role)
- [ ] Billing config: prices stored in config, not hardcoded

### Acceptance criteria
- A Free-plan user cannot add a second property.
- An Agent-plan user can manage multiple clients and generate separate return packs per client.
- An accountant invite grants read-only access to returns and audit log only.
- Stripe webhooks correctly update plan on subscription change or cancellation.

---

## Phase 6 — Integrations

### Deliverables
- [ ] One booking-software API integration (Beds24 or Smoobu — check API docs and terms first)
- [ ] Adapter interface for future integrations
- [ ] Inbound email address per account (forwarded booking confirmation parsing)
- [ ] LLM parsing of booking confirmation emails into Booking schema
- [ ] AI-parsed fields marked for host confirmation; never auto-filed
- [ ] iCal import (detect bookings only; no prices)

### Acceptance criteria
- A booking synced from the chosen booking software appears in Levy Desk within 5 minutes.
- A forwarded Airbnb booking confirmation email is parsed and creates a draft booking with all AI-parsed fields flagged for review.
- An iCal import that detects a date range not covered by any existing booking raises a warning.
- The adapter interface is documented and a second integration can be added without modifying core booking logic.

---

## Risk register

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | Exact start dates for Glasgow, Aberdeen, Stirling, West Dunbartonshire not yet confirmed | High | High | Use conservative (month-start) defaults; flag UNVERIFIED_START_DATE; do not allow returns for those councils until dates are verified |
| R2 | Edinburgh 5-night cap boundary ambiguity for split stays | Medium | Medium | Config option with conservative default; flag affected bookings; require host confirmation before locking return |
| R3 | Booking.com double-remit for Edinburgh | High | High | Flag every Booking.com Edinburgh booking; block return until host confirms |
| R4 | Highland scheme may never pass | Medium | Low | Ship disabled; enable only per account with explicit warning |
| R5 | Welsh register compliance — hosts may not register in time | Medium | Medium | Flag unregistered properties; remind on dashboard |
| R6 | VAT threshold breach from levy turnover | Low | High | Rolling 12-month warning at £5,000 below threshold |
| R7 | LLM parsing of emails produces wrong figures | Medium | High | All AI-parsed fields must be confirmed by host before any calculation is locked |
| R8 | Booking.com / Airbnb export format changes break preset mappings | Medium | Medium | Presets are editable; version the mapping with a note when last verified |
