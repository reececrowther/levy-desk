"""Headless setup run: import demo files through the real UI. Pass file numbers to limit, e.g. 2 3 4 5."""
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = "http://localhost:3005"
DATA = Path(r"E:\Projects\PROJECTS\Levy Desk\docs\demo-data")
FILES = {
    "1": ("01-leith-shore-flat-airbnb.csv", "Leith Shore Flat", "AIRBNB"),
    "2": ("02-royal-mile-studio-bookingcom.csv", "Royal Mile Studio", "BOOKING_COM"),
    "3": ("03-stockbridge-townhouse-airbnb.csv", "Stockbridge Townhouse", "AIRBNB"),
    "4": ("04-stockbridge-townhouse-bookingcom.csv", "Stockbridge Townhouse", "BOOKING_COM"),
    "5": ("05-merchant-city-loft-glasgow-airbnb.csv", "Merchant City Loft", "AIRBNB"),
}
HIDE = "document.addEventListener('DOMContentLoaded',()=>{const s=document.createElement('style');s.textContent='nextjs-portal{display:none!important}';document.head.appendChild(s)})"

which = sys.argv[1:] or list(FILES)
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1440, "height": 900})
    pg.add_init_script(HIDE)
    pg.goto(f"{BASE}/login")
    pg.fill("input[type=email]", "demo@levydesk.test")
    pg.click("button:has-text(\"Sign in\")")
    pg.wait_for_url("**/dashboard")
    for k in which:
        f, prop, src = FILES[k]
        pg.goto(f"{BASE}/imports/new")
        pg.select_option("select >> nth=0", label=prop)
        pg.select_option("select >> nth=1", value=src)
        pg.set_input_files("input[type=file]", str(DATA / f))
        pg.click("text=Upload and map columns")
        pg.wait_for_selector("button:has-text(\"Import bookings\")")
        pg.click("button:has-text(\"Import bookings\")")
        pg.wait_for_load_state("networkidle")
        pg.wait_for_timeout(1500)
        txt = pg.inner_text("main")
        print(f, "->", pg.url, "|", " ".join(txt.split())[:300].encode("ascii", "replace").decode())
    b.close()
