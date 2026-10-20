# Levy Desk — Scheme Rules

**Last updated:** 2026-10-16
**Status key:** VERIFIED = source read and rule confirmed | UNVERIFIED = needs manual check against source

---

## Shared principles (Scotland)

**Status:** UNVERIFIED
**Sources:**
- https://support.visitscotland.org/binaries/content/assets/bsh/2025/10/visitor-levy-faqs.pdf
- https://www.edinburgh.gov.uk/downloads/file/37836/edinburgh-visitor-levy-scheme-information-for-accommodation-providers

- Levy is a **percentage of the accommodation price paid by the guest**, excluding VAT on the accommodation and excluding separately priced extras (meals, parking, transport).
- Where breakfast is included in the room price, it is deducted at its **retail value** before applying the rate.
- Calculated on the **full guest-paid price** including platform commission, not the host's payout.
- Charged **per night per unit** (not per person).
- Returns reported by **date of stay**, not booking date.
- **Cancelled bookings and no-shows**: levy owed is nil; any levy collected in advance is refunded to the guest.
- **Quarterly returns** in arrears.
- Records must be kept for **five years**.
- Scotland disability exemption: guests on qualifying disability benefits pay the levy and reclaim it from the council directly. Providers charge everyone; no provider-side exemption logic required. Show an info note to hosts.

---

## Scotland — Edinburgh

**Status:** UNVERIFIED (source URLs read; detail requires manual verification against the official scheme document)
**Sources:**
- https://www.edinburgh.gov.uk/business/information-businesses
- https://www.edinburgh.gov.uk/downloads/file/37836/edinburgh-visitor-levy-scheme-information-for-accommodation-providers

### Rule version 1 (current)

| Field | Value |
|---|---|
| Rate | 5% |
| Night cap | 5 consecutive nights per stay |
| Stay start date | 2026-07-24 (stays before this date: £0) |
| Booking cut-off | Bookings made **and** paid (in part or full) before 2025-10-01: £0 |
| Retention | Provider keeps 2% of levy collected |
| Filing period | Quarterly in arrears by stay date |
| First return | Covers 2026-07-24 to 2026-09-30; submit 1–31 October 2026; payment due 13 November 2026 |
| Status | Live |

### Ambiguity 1 — 5-night cap boundary for split stays

For a stay that **starts before 2026-07-24** and ends on or after 2026-07-24:
- Conservative default: cap counts from the **first chargeable night** (i.e. the first night on or after 2026-07-24). This means up to 5 chargeable nights even if the stay is long.
- Alternative reading: cap counts from night 1 of the stay regardless of chargeability.
- **Config option:** `edinburghCapBasis`: `first_chargeable_night` (default) | `first_night_of_stay`
- **Flag raised:** `AMBIGUITY_EDINBURGH_CAP_START`
- This config option must be documented and the host must confirm their choice before locking a return containing affected bookings.

### Rule version 2 (example for testing rule versioning — not a real rule change)

| Field | Value |
|---|---|
| Effective from | 2027-04-01 |
| Rate | 6% |
| Night cap | 5 consecutive nights per stay |
| All other fields | Unchanged from version 1 |

> This version exists solely to support worked example 15 (rule-change test). It is not a real legislative change. Remove or replace once actual future rates are known.

---

## Scotland — Glasgow

**Status:** UNVERIFIED
**Source:** https://www.visitscotland.com/travel-planning/visitor-levy

| Field | Value |
|---|---|
| Rate | 5% |
| Night cap | None stated |
| Start date | January 2027 — **exact day UNVERIFIED** |
| Status | Confirmed |

> Exact start date must be verified before filing any Glasgow returns. Until verified, use 2027-01-01 as a conservative assumption and flag the booking with `UNVERIFIED_START_DATE`.

---

## Scotland — Aberdeen

**Status:** UNVERIFIED
**Source:** https://www.visitscotland.com/travel-planning/visitor-levy

| Field | Value |
|---|---|
| Rate | 7% |
| Night cap | None stated |
| Start date | April 2027 — **exact day UNVERIFIED** |
| Status | Confirmed |

> Exact start date must be verified. Conservative assumption: 2027-04-01.

---

## Scotland — Stirling

**Status:** UNVERIFIED
**Source:** https://www.visitscotland.com/travel-planning/visitor-levy

| Field | Value |
|---|---|
| Rate | 3% |
| Night cap | 7 consecutive nights per stay |
| Start date | June 2027 — **exact day UNVERIFIED** |
| Status | Confirmed |

> Exact start date must be verified. Conservative assumption: 2027-06-01.

---

## Scotland — West Dunbartonshire

**Status:** UNVERIFIED
**Source:** https://www.visitscotland.com/travel-planning/visitor-levy

| Field | Value |
|---|---|
| Rate | 5% |
| Night cap | None stated |
| Start date | July 2027 — **exact day UNVERIFIED** |
| Status | Confirmed |

> Exact start date must be verified. Conservative assumption: 2027-07-01.

---

## Scotland — Highland (DISABLED — proposed only)

**Status:** UNVERIFIED
**Source:** https://www.theukpulse.co.uk/travel/highland-council-plans-5-a-night-visitor-levy-targeting-95m-annual-revenue

| Field | Value |
|---|---|
| Charge type | Fixed rate: £5 per room per night (£2 for hostels and campsites) |
| Season | March to November only (months 3–11 inclusive) |
| Retention | Provider keeps 5% |
| Start date | Not set |
| Status | Proposed |
| Enabled | **FALSE** — disabled by default; must be manually enabled per account |

> This scheme is proposed, not legislated. All calculations using this rule raise the flag `HIGHLAND_PROPOSED`. The source is a press article, not an official council document — treat with caution.

---

## Wales — Cardiff

**Status:** UNVERIFIED
**Sources:**
- https://www.gov.wales/node/76838
- https://www.gov.wales/node/75948
- https://www.taxadvisermagazine.com/article/visitor-accommodation-registration-and-levy-new-welsh-tax
- https://www.gov.wales/visitor-levy-accommodation-providers-steps/check

### Rates

| Accommodation type | Guest type | Rate per person per night |
|---|---|---|
| Hotel, B&B, guest house, self-catering, caravan, motorhome, most other | All ages (including babies) | £1.30 (higher rate) |
| Tent on camping pitch; shared room in hostel/bunkhouse/bothy/dormitory | Adult (18+) | £0.75 (lower rate) |
| Tent on camping pitch; shared room in hostel/bunkhouse/bothy/dormitory | Under-18 | £0.00 (nil) |

### Key dates

| Event | Date |
|---|---|
| Welsh Accommodation Register opened | 2026-10-01 |
| Accounting date (bookings from this date must account for the levy) | 2026-09-28 |
| Levy applies to stays from | 2027-04-01 |

> Cardiff is the only Welsh council currently confirmed. The accounting date means bookings **made on or after 2026-09-28** for stays on or after 2027-04-01 must include the levy. Bookings made before 2026-09-28 for stays on or after 2027-04-01 are still chargeable at stay time but flag `BOOKING_PRE_ACCOUNTING_DATE` so the host can confirm whether the levy was priced in.

### Exemptions (Wales)

- Cancelled bookings and no-shows: £0.
- Bookings of **32 nights or more** under one booking (nights need not be consecutive): £0.
- Residents in council temporary accommodation: £0.
- Employees or contractors staying as part of their job: £0.

> The 32-night exemption applies to the booking total, not per stay segment. Implement based on `(checkOut - checkIn)` nights >= 32.

### Guest count

- Based on the number of guests stated on the booking.
- Daily changes in guest numbers are not tracked.
- If guest count is missing, **import the row but raise `WELSH_GUEST_COUNT_MISSING`**. The return is blocked until resolved.

### Welsh register

- Every property must be registered before accepting levy-liable bookings.
- Flag `WELSH_PROPERTY_UNREGISTERED` if the property has no `welshRegisterNumber`.

### Filing (Wales)

- **One return covers all Welsh properties** (not per council).
- Quarterly if expected annual levy > £1,000; otherwise annual (annual return due 31 May).
- Filed with the Welsh Revenue Authority (WRA).

---

## VAT rules (both countries)

**Status:** UNVERIFIED (standard VAT rules; verify rate against current HMRC guidance)

- **VAT-registered providers**: charge VAT at the standard rate (currently 20%) on the levy itself. The levy base excludes VAT on the accommodation.
- **Non-registered providers**: levy counts towards taxable turnover for the VAT registration threshold.
- Show a `VAT_THRESHOLD_WARNING` flag when the host's rolling 12-month turnover including levy is within the configured warning margin of the threshold.
- Config values (stored in DB config table):
  - `vatThresholdPence`: current registration threshold (e.g. 9000000 for £90,000)
  - `vatWarningMarginPence`: how close triggers the warning (default 500000 for £5,000)
  - `vatStandardRate`: currently 20 (stored as integer percent)

---

## Booking.com attribution note

Booking.com has attributed 5% of the nightly rate to the Edinburgh levy since October 2025. This means Booking.com may be collecting and remitting the levy on the guest's payment. **Raise `BOOKING_COM_DOUBLE_REMIT`** on every Booking.com booking for Edinburgh so the host confirms whether Booking.com is remitting and whether the host still owes anything.

---

## Commission and gross amount

When only a payout figure is available and no guest-paid gross is recorded:
1. Raise `BASE_IS_PAYOUT_NOT_GROSS`.
2. If the host has stored a confirmed commission rate for the source, gross up using that rate and mark the gross as estimated.
3. If no commission rate is stored, block the calculation until gross is supplied.
- Ambiguity config option: `levyBaseIncludes`: `guest_paid_gross` (default, conservative) | `payout_only`

---

## Rounding rule

Half-up (round half away from zero) applied at the final levy figure, not at intermediate steps. Configurable per scheme via `roundingRule` in the scheme config: `half_up` (default) | `truncate` | `half_even`. Store intermediate values in full pence (integer arithmetic throughout).
