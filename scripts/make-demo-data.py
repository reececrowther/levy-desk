"""Generate FAKE Airbnb and Booking.com exports for the Levy Desk demo video.

All names, references and amounts are invented. Column headers match the
importer presets in src/lib/importers/presets.ts (verified October 2026).

Run:  python scripts/make-demo-data.py
Output: docs/demo-data/*.csv
"""
import csv
import random
from datetime import date, timedelta
from pathlib import Path

random.seed(2026)
OUT = Path(__file__).resolve().parent.parent / "docs" / "demo-data"
OUT.mkdir(parents=True, exist_ok=True)

FIRST = ["Sophie", "James", "Aisha", "Tom", "Lena", "Marco", "Hannah", "Oliver", "Chloe", "Daniel",
         "Grace", "Lucas", "Ella", "Ben", "Mia", "Sam", "Zara", "Noah", "Freya", "Leo"]
LAST = ["Taylor", "Martin", "Novak", "Rossi", "Kowalski", "Murphy", "Becker", "Dubois", "Evans", "Lindqvist"]


def guest():
    return f"{random.choice(FIRST)} {random.choice(LAST)}"


def airbnb_date(d: date) -> str:
    return d.strftime("%b %d, %Y").replace(" 0", " ")  # "Oct 4, 2026"


def make_stays(start: date, end: date, nightly: tuple, cleaning: int, specials: list):
    """Random back-to-back stays between start and end, plus hand-made special stays."""
    stays, d = [], start
    while d < end - timedelta(days=2):
        d += timedelta(days=random.choice([0, 0, 1, 2, 3]))
        nights = random.choice([2, 2, 3, 3, 4, 5])
        co = d + timedelta(days=nights)
        if co > end:
            break
        stays.append(dict(ci=d, co=co, rate=random.randint(*nightly), cleaning=cleaning,
                          booked=d - timedelta(days=random.randint(10, 120)),
                          guests=random.choice([1, 2, 2, 2, 3, 4]), status="ok", note=""))
        d = co
    # remove randoms that clash with specials, then add specials
    for s in specials:
        stays = [x for x in stays if x["co"] <= s["ci"] or x["ci"] >= s["co"]]
        stays.append(dict(dict(cleaning=cleaning, guests=2, status="ok"), **s))
    return sorted(stays, key=lambda x: x["ci"])


def write_airbnb(name, stays, prefix):
    rows = []
    for i, s in enumerate(stays):
        nights = (s["co"] - s["ci"]).days
        amount = nights * s["rate"] + s["cleaning"]
        fee = round(amount * 0.155, 2)
        rows.append({
            "Date": airbnb_date(s["ci"]),
            "Type": "Cancelled reservation" if s["status"] == "cancel" else "Reservation",
            "Confirmation Code": f"HM{prefix}{1000 + i * 7}",
            "Booked": airbnb_date(s["booked"]),
            "Start Date": airbnb_date(s["ci"]),
            "End Date": airbnb_date(s["co"]),
            "Nights": nights,
            "Guest": guest(),
            "Guests": s["guests"],
            "Listing": name,
            "Currency": "GBP",
            "Amount": f"{amount:.2f}",
            "Cleaning Fee": f"{s['cleaning']:.2f}",
            "Host Fee": f"{fee:.2f}",
            "Paid Out": f"{amount - fee:.2f}",
            "Demo note (delete before upload if you like)": s.get("note", ""),
        })
    return rows


def write_booking(name, stays, prefix):
    rows = []
    for i, s in enumerate(stays):
        nights = (s["co"] - s["ci"]).days
        amount = nights * s["rate"] + s["cleaning"]
        comm = round(amount * 0.15, 2)
        rows.append({
            "Reservation ID": f"{prefix}{4100000 + i * 13}",
            "Property Name": name,
            "Guest Name": guest(),
            "Reservation Creation Date": s["booked"].isoformat(),
            "Arrival Date": s["ci"].isoformat(),
            "Departure Date": s["co"].isoformat(),
            "Number of guests": s["guests"],
            "Status": "cancelled_by_guest" if s["status"] == "cancel" else "ok",
            "Currency": "GBP",
            "Amount": f"{amount:.2f}",
            "Commission Amount": f"{comm:.2f}",
            "Outstanding Balance": f"{amount - comm:.2f}",
            "Demo note (delete before upload if you like)": s.get("note", ""),
        })
    return rows


def save(fname, rows):
    with open(OUT / fname, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(rows)
    print(f"{fname}: {len(rows)} rows")


Q4s, Q4e = date(2026, 10, 1), date(2026, 12, 31)

# 1. Leith Shore Flat (owner: Morag Fraser) - Airbnb
leith = make_stays(Q4s, Q4e, (110, 160), 60, [
    dict(ci=date(2026, 10, 9), co=date(2026, 10, 16), rate=130, booked=date(2026, 8, 2),
         note="7 nights: levy only on the first 5 (Edinburgh cap)"),
    dict(ci=date(2026, 12, 29), co=date(2027, 1, 2), rate=210, booked=date(2026, 9, 14),
         note="New Year stay: goes in Q1 2027 (check-out quarter)"),
    dict(ci=date(2026, 11, 20), co=date(2026, 11, 23), rate=125, booked=date(2026, 10, 30),
         status="cancel", note="Cancelled before arrival: no levy"),
])
save("01-leith-shore-flat-airbnb.csv", write_airbnb("Leith Shore Flat", leith, "AL"))

# 2. Royal Mile Studio (owner: Morag Fraser) - Booking.com
royal = make_stays(Q4s, Q4e, (95, 140), 45, [
    dict(ci=date(2026, 10, 2), co=date(2026, 10, 5), rate=120, booked=date(2025, 8, 20),
         note="Booked before 1 Oct 2025: out of scope, levy GBP 0"),
])
save("02-royal-mile-studio-bookingcom.csv", write_booking("Royal Mile Studio", royal, "53"))

# 3. Stockbridge Townhouse (owner: Thistle Demo Holdings Ltd, VAT-registered) - Airbnb + Booking.com
stock_a = make_stays(Q4s, date(2026, 11, 15), (220, 320), 95, [
    dict(ci=date(2026, 10, 23), co=date(2026, 10, 31), rate=260, booked=date(2026, 7, 11), guests=6,
         note="8 nights, VAT-registered owner: levy on net price, VAT on levy to HMRC"),
])
stock_b = make_stays(date(2026, 11, 16), Q4e, (200, 300), 95, [])
save("03-stockbridge-townhouse-airbnb.csv", write_airbnb("Stockbridge Townhouse", stock_a, "ST"))
save("04-stockbridge-townhouse-bookingcom.csv", write_booking("Stockbridge Townhouse", stock_b, "61"))

# 4. Merchant City Loft, Glasgow (owner: Priya Shah) - Airbnb, future stays after 25 Jan 2027
glas = make_stays(date(2027, 1, 20), date(2027, 3, 31), (90, 140), 50, [
    dict(ci=date(2027, 2, 6), co=date(2027, 2, 13), rate=115, booked=date(2026, 9, 3),
         note="Glasgow: no night cap, levy on all 7 nights"),
    dict(ci=date(2027, 2, 20), co=date(2027, 2, 23), rate=105, booked=date(2026, 3, 12),
         note="Booked before 1 Apr 2026: out of scope for Glasgow"),
    dict(ci=date(2027, 1, 22), co=date(2027, 1, 27), rate=100, booked=date(2026, 10, 1),
         note="Crosses Glasgow start (25 Jan): only nights from 25 Jan charged"),
])
save("05-merchant-city-loft-glasgow-airbnb.csv", write_airbnb("Merchant City Loft", glas, "GL"))
