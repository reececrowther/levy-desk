"""Record the Levy Desk walkthrough against the LOCAL demo app (localhost:3005, demo DB on 5433)."""
import json
import shutil
import subprocess
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

HERE = Path(__file__).parent
BASE = "http://localhost:3005"
DATA = Path(r"E:\Projects\PROJECTS\Levy Desk\docs\demo-data")
RAW = HERE / "raw"
W, H = 1440, 900

OVERLAY = r"""
(() => {
  const css = `nextjs-portal{display:none!important}
  #demo-cap{position:fixed;left:50%;bottom:36px;transform:translateX(-50%);max-width:1000px;
    background:rgba(28,25,23,.92);color:#fff;font:600 22px/1.4 system-ui,Segoe UI,sans-serif;
    padding:14px 26px;border-radius:12px;z-index:2147483647;text-align:center;box-shadow:0 8px 30px rgba(0,0,0,.25);
    transition:opacity .35s}
  #demo-cap:empty{opacity:0}
  #demo-cur{position:fixed;width:22px;height:22px;border-radius:50%;background:rgba(234,88,12,.85);
    border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.35);z-index:2147483646;pointer-events:none;
    transform:translate(-50%,-50%);transition:left .6s ease,top .6s ease}
  #demo-cur.click{animation:pulse .35s}
  @keyframes pulse{50%{transform:translate(-50%,-50%) scale(1.6)}}`;
  const add = () => {
    if (document.getElementById('demo-cap')) return;
    const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);
    const c = document.createElement('div'); c.id = 'demo-cap'; c.textContent = sessionStorage.getItem('cap') || '';
    const k = document.createElement('div'); k.id = 'demo-cur';
    const pos = JSON.parse(sessionStorage.getItem('cur') || '[720,450]');
    k.style.left = pos[0] + 'px'; k.style.top = pos[1] + 'px';
    document.body.append(c, k);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', add); else add();
})();
"""


def caption(pg, text):
    pg.evaluate("t => { sessionStorage.setItem('cap', t); const c=document.getElementById('demo-cap'); if(c) c.textContent=t }", text)


def move(pg, loc):
    loc.scroll_into_view_if_needed()
    box = loc.bounding_box()
    x, y = box["x"] + box["width"] / 2, box["y"] + box["height"] / 2
    pg.evaluate("([x,y]) => { sessionStorage.setItem('cur', JSON.stringify([x,y])); const k=document.getElementById('demo-cur'); if(k){k.style.left=x+'px';k.style.top=y+'px'} }", [x, y])
    pg.wait_for_timeout(700)


def click(pg, loc, wait=900):
    move(pg, loc)
    pg.evaluate("() => { const k=document.getElementById('demo-cur'); if(k){k.classList.remove('click'); void k.offsetWidth; k.classList.add('click')} }")
    pg.wait_for_timeout(250)
    loc.click()
    pg.wait_for_timeout(wait)


def settle(pg, ms=600):
    pg.wait_for_load_state("networkidle")
    pg.wait_for_timeout(ms)


def card(pg, title, sub, ms):
    pg.set_content(f"""<html><body style="margin:0;height:100vh;display:flex;align-items:center;justify-content:center;
      background:#faf6f1;font-family:system-ui,Segoe UI,sans-serif;color:#1c1917">
      <div style="max-width:1050px;text-align:center;padding:40px">
      <div style="font-size:22px;font-weight:700;letter-spacing:.04em;color:#c2410c;margin-bottom:22px">LEVY DESK</div>
      <div style="font-size:50px;font-weight:700;line-height:1.2">{title}</div>
      <div style="font-size:26px;margin-top:26px;color:#57534e;line-height:1.5">{sub}</div></div></body></html>""")
    pg.wait_for_timeout(ms)


def main():
    if RAW.exists():
        shutil.rmtree(RAW)
    with sync_playwright() as p:
        b = p.chromium.launch()
        # login outside the recording, then reuse cookies
        ctx0 = b.new_context(viewport={"width": W, "height": H})
        lp = ctx0.new_page()
        lp.goto(f"{BASE}/login")
        lp.fill("input[type=email]", "demo@levydesk.test")
        lp.click('button:has-text("Sign in")')
        lp.wait_for_url("**/dashboard")
        # warm up pages so dev compilation doesn't show on camera
        for path in ["/dashboard", "/imports/new", "/bookings", "/exceptions", "/returns", "/returns/new", "/properties"]:
            lp.goto(BASE + path)
            settle(lp, 200)
        state = ctx0.storage_state()
        ctx0.close()

        ctx = b.new_context(viewport={"width": W, "height": H}, storage_state=state,
                            record_video_dir=str(RAW), record_video_size={"width": W, "height": H})
        ctx.add_init_script(OVERLAY)
        pg = ctx.new_page()

        # 1. Title
        card(pg, "Your clients' visitor levy figures,<br>from their Airbnb and Booking.com exports",
             "Edinburgh now. Glasgow from 25 January.<br>Every figure checked against the council's own guidance.", 5200)

        # 2. Dashboard
        pg.goto(f"{BASE}/dashboard"); settle(pg)
        caption(pg, "A letting agent with 3 owners and 4 properties. (Demo data: all names are made up.)")
        pg.wait_for_timeout(3500)

        # 3. Upload
        click(pg, pg.locator("aside a[href='/imports'], nav a[href='/imports']").first)
        pg.goto(f"{BASE}/imports/new"); settle(pg)
        caption(pg, "Upload an owner's Airbnb export. No retyping.")
        sel = pg.locator("select").nth(0)
        move(pg, sel); sel.select_option(label="Leith Shore Flat"); pg.wait_for_timeout(700)
        sel2 = pg.locator("select").nth(1)
        move(pg, sel2); sel2.select_option(value="AIRBNB"); pg.wait_for_timeout(700)
        f = pg.locator("input[type=file]")
        move(pg, f); f.set_input_files(str(DATA / "01-leith-shore-flat-airbnb.csv")); pg.wait_for_timeout(900)
        click(pg, pg.locator("button:has-text('Upload and map columns')"), 400)
        pg.wait_for_selector("button:has-text('Import bookings')"); settle(pg)
        caption(pg, "Columns are matched automatically for Airbnb and Booking.com.")
        pg.wait_for_timeout(1800)
        pg.mouse.wheel(0, 500); pg.wait_for_timeout(1500)
        click(pg, pg.locator("button:has-text('Import bookings')"), 400)
        pg.wait_for_url("**/results"); settle(pg)
        caption(pg, "17 bookings imported, 0 errors.")
        pg.wait_for_timeout(3000)

        # 4. Working for the 7-night stay
        pg.goto(f"{BASE}/bookings"); settle(pg)
        caption(pg, "Every booking shows its working.")
        row = pg.locator("tr", has_text="Leith Shore Flat").filter(has_text="2026-10-09").first
        row.scroll_into_view_if_needed(); pg.wait_for_timeout(800)
        click(pg, row.locator("button:has-text('Show working')"), 900)
        caption(pg, "A 7-night stay: levy on the first 5 nights only. The cleaning fee counts, as the council's guidance says.")
        pg.wait_for_timeout(6500)
        pg.keyboard.press("Escape"); pg.wait_for_timeout(600)

        # 5. Exceptions
        click(pg, pg.locator("a[href='/exceptions']").first, 300)
        settle(pg)
        caption(pg, "Anything uncertain is flagged for you to check, not guessed.")
        pg.wait_for_timeout(2000)
        ex = pg.locator("text=Booked before 1 October 2025").first
        if ex.count():
            click(pg, ex, 900)
        pg.wait_for_timeout(3000)

        # 6. Return
        click(pg, pg.locator("a[href='/returns']").first, 300)
        pg.goto(f"{BASE}/returns/new"); settle(pg)
        caption(pg, "Generate the quarter's return.")
        s1 = pg.locator("select").nth(0)
        move(pg, s1); s1.select_option(label="City of Edinburgh"); pg.wait_for_timeout(1200)
        s2 = pg.locator("select").nth(1)
        move(pg, s2); s2.select_option(value="2026-Q4"); pg.wait_for_timeout(700)
        click(pg, pg.locator("button:has-text('Generate return')"), 400)
        pg.wait_for_url("**/returns/c*"); settle(pg)
        caption(pg, "Edinburgh, October to December: the figures you enter on visitorlevy.scot, due 30 January.")
        pg.wait_for_timeout(4500)
        pg.mouse.wheel(0, 450); pg.wait_for_timeout(2500)
        pg.mouse.wheel(0, -450); pg.wait_for_timeout(1200)

        # 7. Owner statement
        pg.goto(f"{BASE}/properties"); settle(pg)
        caption(pg, "And a statement for each property, ready to send to its owner.")
        click(pg, pg.locator("tr", has_text="Leith Shore Flat").locator("a:has-text('Statement')"), 300)
        settle(pg)
        v = pg.locator("button:has-text('View'), a:has-text('View')").first
        if v.count():
            click(pg, v, 300); settle(pg)
        pg.wait_for_timeout(2500)
        pg.mouse.wheel(0, 400); pg.wait_for_timeout(2500)

        # 8. Glasgow
        pg.goto(f"{BASE}/bookings"); settle(pg)
        row = pg.locator("tr", has_text="Merchant City Loft").filter(has_text="2027-02-06").first
        row.scroll_into_view_if_needed(); pg.wait_for_timeout(600)
        caption(pg, "Glasgow starts 25 January with different rules. Same upload.")
        click(pg, row.locator("button:has-text('Show working')"), 900)
        caption(pg, "Glasgow: no night cap, so all 7 nights count. You keep 1.5%.")
        pg.wait_for_timeout(6000)
        pg.keyboard.press("Escape"); pg.wait_for_timeout(500)
        caption(pg, "")

        # 9. End card
        card(pg, "I'll set up your owners for free<br>before the 30 January return.",
             "Reply to my email with one owner's Airbnb or Booking.com export.<br>"
             "After that, £25 a month including 5 units, then £5 per unit.<br><br>"
             "<b>levydesk.co.uk</b> · Reece Crowther", 7000)

        video = pg.video.path()
        ctx.close()
        b.close()
    print("RAW", video)


if __name__ == "__main__":
    main()
