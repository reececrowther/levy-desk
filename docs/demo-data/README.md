# Demo data for the walkthrough video

**Everything here is fake.** The guests, owners, booking references and amounts are all invented. Regenerate with `python scripts/make-demo-data.py`. To check the files against the importer, run `npx tsx scripts/check-demo-data.ts` (all 71 rows passed on 9 Nov 2026).

## Set up a demo account first

Use a separate demo workspace, never a real customer's.

| Client (owner) | Property | Council | File(s) |
|---|---|---|---|
| Morag Fraser | Leith Shore Flat | Edinburgh | 01 (Airbnb) |
| Morag Fraser | Royal Mile Studio | Edinburgh | 02 (Booking.com) |
| Thistle Demo Holdings Ltd | Stockbridge Townhouse | Edinburgh | 03 (Airbnb), 04 (Booking.com) |
| Priya Shah | Merchant City Loft | Glasgow | 05 (Airbnb) |

## The bookings to click on in the video

The last column of each file ("Demo note") marks these rows. You can delete that column before uploading. The importer ignores columns it doesn't map, so leaving it is also fine.

| File | Stay | What it shows |
|---|---|---|
| 01 | 9 to 16 Oct, 7 nights | Edinburgh 5-night cap |
| 01 | Every Airbnb row | Cleaning fee is included in the levy base |
| 01 | 29 Dec to 2 Jan | New Year stay goes in Q1 2027 (the check-out quarter) |
| 01 | 20 to 23 Nov, cancelled | No levy on a cancellation |
| 02 | 2 to 5 Oct, booked Aug 2025 | Flagged "payment date needed": exempt only if also paid before 1 Oct 2025 |
| 03 | 23 to 31 Oct, 8 nights | 5-night cap on a bigger booking (VAT is set per workspace, not per owner) |
| 05 | 6 to 13 Feb 2027 | Glasgow has no night cap |
| 05 | 20 to 23 Feb 2027, booked Mar 2026 | Glasgow: booked before 1 Apr 2026, so out of scope |
| 05 | 22 to 27 Jan 2027 | Crosses Glasgow's 25 Jan start date |

**Checked 9 Nov 2026:** all of the above behave as described in the local demo app (demo database on port 5433). The walkthrough video is in docs/demo-video/; to re-record it, use scripts/demo-video/.
