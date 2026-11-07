# Levy Desk — Scheme Rules

**Last updated:** 2026-11-07
**Status key:** VERIFIED = source read and rule confirmed | UNVERIFIED = needs manual check against source | DISCREPANCY = source read, engine does not yet match it

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
- Returns reported by stay, not booking date. Edinburgh: a stay spanning two quarters belongs to the quarter of **check-out** (v2.1 p.13). Check each council.
- **Cancelled bookings and no-shows**: levy owed is nil; any levy collected in advance is refunded to the guest.
- **Quarterly returns** in arrears.
- Records must be kept for **five years**.
- Scotland disability exemption: guests on qualifying disability benefits pay the levy and reclaim it from the council directly. Providers charge everyone; no provider-side exemption logic required. Show an info note to hosts.

---

## Scotland — Edinburgh

**Status:** PARTLY VERIFIED (2026-11-07) against the council's official provider guidance. Items marked VERIFIED below match the source; items marked DISCREPANCY are known gaps between the engine and the guidance, scheduled for the next phase.
**Primary source (read in full):**
- City of Edinburgh Council, *Edinburgh Visitor Levy Scheme: Information for accommodation providers*, **Version 2.1, September 2026**: https://www.edinburgh.gov.uk/downloads/file/40692/edinburgh-visitor-levy-scheme-information-for-accommodation-providers
**Other sources:**
- https://www.edinburgh.gov.uk/business/scheme-edinburgh-visitor-levy/2 (scheme summary)
- Airbnb Help Centre article 4105 (host is liable; Airbnb does not pay the council): https://www.airbnb.co.uk/help/article/4105

### Rule version 1 (current, no end date)

| Field | Value | Status / source (v2.1 page) |
|---|---|---|
| Rate | 5% of the accommodation-only portion, net of VAT | VERIFIED p.3 |
| Night cap | First 5 consecutive nights **per chargeable transaction** (booking) | VERIFIED p.7 |
| Cap valuation | Use the actual value of the first 5 nights, not an average; per-stay fees (e.g. one-off cleaning) are charged in full | DISCREPANCY: engine averages gross across all nights (phase 2) |
| Stay start | Stays **commencing** on/after 2026-07-24. Stays that began before 24 July are not liable at all, even if they finish after | DISCREPANCY: engine charges post-24-July nights of such stays (phase 2) |
| Booking cut-off | Exempt if paid in part or full before 2025-10-01. Payment must be tangible, room-attributable and **non-refundable** (refundable deposits do not count); booking must state specific dates, rooms and nightly price | VERIFIED p.10. DISCREPANCY: engine falls back to booking date when no payment date is recorded (phase 2) |
| Levy base: cleaning | Standard cleaning **is included** even when itemised separately; excluded only if guests can genuinely opt out | VERIFIED p.4. Fixed 2026-11-07 (Airbnb preset no longer deducts Cleaning Fee) |
| Levy base: extras | Exclude meals/drinks, parking, laundry, entertainment, transport when separately chargeable | VERIFIED p.3 |
| Levy base: commission | Include commission charged to the visitor (OTA as agent). Exclude commission the provider pays the OTA that is not charged to the visitor. Wholesaler resale: use the provider's sale price | VERIFIED pp.5-7 |
| Platform bookings | Provider remains the liable person. No agreement lets an OTA pay the council directly; OTA-collected levy is passed to the provider, who remits | VERIFIED pp.6-7. Fixed 2026-11-07 (`BOOKING_COM_DOUBLE_REMIT` no longer raised) |
| VAT | Levy is turnover; VAT-registered providers account for VAT on it to **HMRC**. VAT is not part of the council payment | VERIFIED p.4. Fixed 2026-11-07 (net payable excludes VAT) |
| Retention | Provider keeps 2% of total levy due; calculated by visitorlevy.scot on the return total | VERIFIED p.12 |
| Cancellations / no-shows | Not payable if the visitor never takes entry; refund any levy collected. If the visitor took entry and is later refunded, levy is still due | VERIFIED pp.9-10 |
| Gift cards, points, credit | Chargeable at GBP value | VERIFIED p.8 |
| Complimentary stays | Genuinely free stays: no chargeable transaction | VERIFIED pp.8-9 |
| Exemptions | Exempt individuals pay the provider and reclaim from the council (no provider-side logic). Charities can apply for a site exemption | VERIFIED p.11 |
| Quarter assignment | Stay belongs to the quarter in which the visitor **checks out** | DISCREPANCY: engine uses check-in (phase 2) |
| Deadlines | Return due within 30 days of quarter end; payment due ~44 days after quarter end (see table) | VERIFIED p.13 |
| Portal | visitorlevy.scot | VERIFIED p.13 |
| Return contents | **Monthly** figures: accommodation-only revenue, revenue from pre-1-Oct-2025 bookings, revenue from night 6 onwards; availability; (on request) occupied nights, etc. | VERIFIED p.14. DISCREPANCY: return pack gives quarterly totals (phase 3) |
| Record retention | 5 years from submission (5 years after the stay for pre-Oct-2025 bookings) | VERIFIED p.15 |
| Penalties | Penalty Framework approved 26 May 2026, published on the council website; due diligence taken into account | VERIFIED p.15 (amounts not yet recorded here) |

### Edinburgh deadlines (v2.1 p.13)

| Stays | Submit return | Payment due |
|---|---|---|
| 24 Jul – 30 Sep 2026 | 1 – 30 Oct 2026 | by 13 Nov 2026 |
| 1 Oct – 31 Dec 2026 | 1 – 30 Jan 2027 | by 13 Feb 2027 |
| 1 Jan – 31 Mar 2027 | 1 – 30 Apr 2027 | by 14 May 2027 |
| 1 Apr – 30 Jun 2027 | 1 – 30 Jul 2027 | by 13 Aug 2027 |
| 1 Jul – 30 Sep 2027 | 1 – 30 Oct 2027 | by 13 Nov 2027 |

### Removed: Ambiguity 1 (cap basis for stays crossing 24 July 2026)

Resolved by v2.1 p.10: stays that commenced before 24 July 2026 are not liable at all. `edinburghCapBasis` and `AMBIGUITY_EDINBURGH_CAP_START` become redundant once the phase 2 fix lands.

### Removed: Rule version 2 (6% from 2027-04-01)

This was a hypothetical rule added to test rule versioning, but it was live in `SCHEME_RULES`, so April 2027 stays were being charged 6%. Removed 2026-11-07; the versioning test now builds its own fixture. Any stored calculations for Edinburgh stays from 1 April 2027 must be recalculated.

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

## Platform bookings (Airbnb, Booking.com, VRBO)

**Status:** VERIFIED for Edinburgh (v2.1 pp.6-7; Airbnb Help Centre 4105).

Platforms do not pay the levy to the council on the host's behalf. The accommodation provider remains the liable person and includes platform bookings in their return. The former `BOOKING_COM_DOUBLE_REMIT` flag was based on an incorrect assumption and is no longer raised (kept in the enum only so older stored calculations still render). Re-check this for each new council.

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
