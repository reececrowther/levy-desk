# Levy Desk — Product Specification

**Version:** 0.1 (Phase 0 draft)
**Last updated:** 2026-10-16

---

## 1. Problem

UK councils are introducing visitor levies (tourist taxes). Accommodation providers are legally liable even when a platform (Airbnb, Booking.com) collects payment. Each council calculates the levy differently. Hosts currently work it out in spreadsheets — an error-prone process that risks underpayment penalties.

## 2. What Levy Desk does

1. Imports bookings from CSV, Excel, or (later) direct API.
2. Applies the correct scheme rule for the property's council and the stay dates.
3. Flags any booking that requires a human decision before the return can be filed.
4. Produces a return pack (CSV + PDF) laid out to match the council return form.
5. Tracks deadlines and reminds hosts.

It does **not** file returns or make payments on the host's behalf.

## 3. Users (priority order)

| Segment | Scale | Notes |
|---|---|---|
| Letting agents | 20–200 units | Multi-client workspace; agent pricing |
| Owners | 2–20 units | Owner pricing; self-service |
| B&Bs and small hotels | 1–10 rooms | Per-property pricing |
| Bookkeepers | Serve multiple hosts | Read-only accountant access |

Free tier: one unit.

## 4. Data model

### Account
- `type`: owner | agent | accountant
- `plan`: free | owner | agent | bnb
- `vatRegistered`: boolean
- `vatNumber`: string (optional)
- `rollingTurnover12m`: pence — used for VAT threshold warning

### Client (agents only)
- `name`, `contactEmail`
- Belongs to an Account (agent)
- Has many Properties

### Property
- `name`, `address`, `postcode`, `council`, `country`
- `accommodationType`: self_catering | bnb_guest_house | hotel | hostel_dorm | campsite | other
- `unitsOrRooms`: integer
- `licenceNumber`: string (Scotland)
- `welshRegisterNumber`: string (Wales) — required from 2026-10-01
- `breakfastIncluded`: boolean
- `breakfastRetailValuePence`: integer (pence per person per night; required when `breakfastIncluded` is true)

### Booking
- `source`: airbnb | booking_com | vrbo | direct | software | other
- `externalRef`: string (deduplication key, unique per source + property)
- `bookedAt`: date — date booking was made
- `firstPaymentAt`: date — date first payment received (for Edinburgh booking cut-off rule)
- `checkIn`: date
- `checkOut`: date
- `adults`: integer
- `under18s`: integer
- `guestPaidGrossPence`: integer — the total the guest paid INCLUDING platform commission, EXCLUDING VAT on accommodation
- `extrasPence`: integer — separately priced extras (meals, parking, transport) excluded from levy base
- `commissionPence`: integer (optional)
- `payoutPence`: integer (optional)
- `currency`: ISO 4217 (GBP default)
- `status`: confirmed | cancelled | no_show
- `rawImportRow`: JSON — original import data for audit

### SchemeRule
- `council`: string (slug, e.g. `edinburgh`)
- `country`: scotland | wales
- `effectiveFrom`: date
- `effectiveTo`: date (nullable — open-ended)
- `chargeType`: percentage | per_room_per_night | per_person_per_night
- `rates`: JSON — structure varies by chargeType (see RULES.md)
- `nightCap`: integer (nullable)
- `seasonMonths`: integer[] (nullable — 1-indexed; Highland uses months 3–11)
- `bookingCutOffDate`: date (nullable — Edinburgh: bookings paid before 2025-10-01 owe nothing)
- `stayStartDate`: date (nullable — Edinburgh: stays before 2026-07-24 owe nothing)
- `retentionPercentage`: decimal (e.g. 2 for 2%)
- `filingFrequency`: quarterly | annual
- `status`: live | confirmed | proposed
- `enabled`: boolean (false for Highland until enabled)
- `sourceUrl`: string
- `verified`: boolean

### Calculation
- `bookingId`: FK
- `schemeRuleId`: FK (pinned version)
- `nightsCharged`: integer
- `basePence`: integer
- `exclusionsPence`: integer
- `levyPence`: integer
- `vatOnLevyPence`: integer (0 for non-VAT hosts)
- `retentionPence`: integer
- `flags`: string[] — typed enum values from `src/levy/flags.ts`
- `working`: JSON — full step-by-step working for audit and display

### Return
- `accountId`: FK
- `council`: string
- `periodStart`: date
- `periodEnd`: date
- `totalLevyPence`: integer
- `totalVatOnLevyPence`: integer
- `totalRetentionPence`: integer
- `netPayablePence`: integer
- `status`: draft | ready | filed | paid
- `lockedAt`: timestamp (nullable) — once set, calculations in this period are frozen
- `filedRef`: string (optional — council's acknowledgement reference)

### AuditLog
- `accountId`, `userId`
- `action`: string
- `entityType`, `entityId`
- `before`: JSON
- `after`: JSON
- `createdAt`: timestamp

## 5. Rules engine (`src/levy/`)

The engine is a pure function:

```typescript
calculate(booking: Booking, property: Property, rules: SchemeRule[]): Calculation
```

- Selects the correct rule version for the council and stay dates.
- Returns a `Calculation` with full working and zero or more flags.
- Has no imports from Next.js, Prisma, or any framework.
- Fully unit tested with all 15 worked examples from the brief plus edge cases.

## 6. Exception flags (typed enum)

| Flag | Meaning |
|---|---|
| `AMBIGUITY_EDINBURGH_CAP_START` | Stay starts before 2026-07-24; it is unclear whether the 5-night cap counts from night 1 or the first chargeable night |
| `COMMISSION_UNKNOWN` | Only payout is known; gross needs confirming or grossing-up |
| `BOOKING_COM_DOUBLE_REMIT` | Booking.com source — confirm who is remitting the levy |
| `BASE_IS_PAYOUT_NOT_GROSS` | Gross not available; flagged for host to supply |
| `WELSH_GUEST_COUNT_MISSING` | Cardiff booking has no guest count; return is blocked |
| `BOOKING_PRE_ACCOUNTING_DATE` | Cardiff booking made before 2026-09-28; host should confirm levy was priced in |
| `WELSH_PROPERTY_UNREGISTERED` | Property has no Welsh register number |
| `VAT_THRESHOLD_WARNING` | Rolling 12-month turnover including levy is within £5,000 of the VAT threshold |
| `HIGHLAND_PROPOSED` | Highland scheme is proposed, not confirmed; calculation is indicative only |

## 7. VAT handling

- VAT-registered hosts: levy base excludes VAT on accommodation; 20% VAT is charged on the levy itself.
- Non-VAT hosts: no VAT on levy; levy counts towards taxable turnover. Show a warning when rolling 12-month turnover including levy approaches the threshold (threshold stored in config).
- VAT threshold: stored as config (`vatThresholdPence`); flag when within `vatWarningMarginPence` of threshold (default £5,000).

## 8. Quarterly return logic

- Scotland: quarterly in arrears, by stay date. Quarters: Q1 Jan–Mar, Q2 Apr–Jun, Q3 Jul–Sep, Q4 Oct–Dec.
- Wales: quarterly if expected annual levy > £1,000, otherwise annual (due 31 May). One return covers all Welsh properties.
- Locking a return freezes all its calculations. Later edits require an explicit amendment logged in AuditLog.
- Nil returns must still be filed; the system prompts for them.

## 9. Import pipeline

- Accepts CSV and Excel.
- Column-mapping screen with presets for Airbnb and Booking.com (user-editable because export formats change).
- Row-level Zod validation; errors shown inline.
- Deduplication by `source + externalRef + propertyId`.
- Rows with missing guest count or gross amount are imported but flagged.

## 10. Return pack output

- CSV: one row per booking with full working columns.
- PDF: summary totals laid out to match the council return form, plus a per-booking appendix.
- Separate section showing retention amount kept by host.

## 11. Billing (Phase 5)

| Plan | Price | Includes |
|---|---|---|
| Free | £0 | 1 unit |
| Owner | £8 / unit / month | Unlimited units |
| Agent | £5 / unit / month (min £99/month) | Multi-client workspace |
| B&B / Hotel | £25 / property / month | Up to 10 rooms |

Prices in config; Stripe for billing.

## 12. Known ambiguities (to be resolved before filing)

See flags enum in §6. Full detail in RULES.md.

1. **Edinburgh 5-night cap boundary**: for stays starting before 2026-07-24, does the cap count from night 1 of the stay or from the first chargeable night?
2. **Commission inside the base**: when only a payout is known, the gross must be confirmed.
3. **Booking.com double-remit**: Booking.com attributed 5% levy since October 2025; host must confirm who remits.
4. **Payout vs gross**: flag and request gross when only payout is available.
5. **Welsh guest count**: block the return until guest count is supplied.
