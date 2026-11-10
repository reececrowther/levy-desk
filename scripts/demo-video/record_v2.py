"""Levy Desk walkthrough v2: narration (edge-tts), zoom-ins and highlights.
Records the LOCAL demo app (localhost:3005, demo DB on 5433). Usage: python record_v2.py [voice]
"""
import json
import re
import shutil
import subprocess
import sys
import time
from pathlib import Path

import imageio_ffmpeg
from playwright.sync_api import sync_playwright

HERE = Path(__file__).parent
BASE = "http://localhost:3005"
DATA = Path(r"E:\Projects\PROJECTS\Levy Desk\docs\demo-data")
OUTDIR = Path(r"E:\Projects\PROJECTS\Levy Desk\docs\demo-video")
RAW, VOICE = HERE / "raw2", HERE / "voice"
W, H = 1440, 900
FF = imageio_ffmpeg.get_ffmpeg_exe()
VOICE_NAME = sys.argv[1] if len(sys.argv) > 1 else "en-GB-RyanNeural"

LINES = {
    "intro": "If you manage short lets in Edinburgh or Glasgow, here's how Levy Desk turns your booking exports into visitor levy figures for every owner.",
    "dash": "This is a demo letting agent with three owners and four properties. All the names are made up.",
    "upload": "Upload an owner's Airbnb export. There's nothing to retype.",
    "map": "Levy Desk recognises Airbnb and Booking.com columns automatically.",
    "results": "Seventeen bookings imported, with no errors.",
    "working": "Every booking shows its working. This seven-night stay is only charged for the first five nights, and the cleaning fee counts, just as the council's guidance says.",
    "exceptions": "Anything uncertain is flagged for you to check, rather than guessed. This booking was made before October 2025, so it's only exempt if it was also paid before then.",
    "return1": "Then generate the quarter's return.",
    "return2": "Here's Edinburgh for October to December. These are the figures you enter on visitorlevy dot scot, due by the thirtieth of January.",
    "statement": "And there's a statement for each property, ready to send to its owner.",
    "glasgow": "Glasgow's levy starts on the twenty-fifth of January, with different rules. There's no night cap, so all seven nights count, and you keep one and a half percent.",
    "end": "Reply to my email with one owner's export, and I'll set up your owners for free before the January return.",
}

OVERLAY = r"""
(() => {
  const ss={get:k=>{try{return sessionStorage.getItem(k)}catch(e){return null}}};
  const css = `nextjs-portal{display:none!important}
  #demo-cap{position:fixed;left:50%;bottom:36px;transform:translateX(-50%);max-width:1000px;
    background:rgba(28,25,23,.92);color:#fff;font:600 22px/1.4 system-ui,Segoe UI,sans-serif;
    padding:14px 26px;border-radius:12px;z-index:2147483647;text-align:center;box-shadow:0 8px 30px rgba(0,0,0,.25);transition:opacity .35s}
  #demo-cap:empty{opacity:0}
  #demo-cur{position:fixed;width:22px;height:22px;border-radius:50%;background:rgba(234,88,12,.85);border:3px solid #fff;
    box-shadow:0 2px 8px rgba(0,0,0,.35);z-index:2147483646;pointer-events:none;transform:translate(-50%,-50%);
    transition:left .6s ease,top .6s ease,opacity .3s}
  #demo-cur.click{animation:pulse .35s}
  @keyframes pulse{50%{transform:translate(-50%,-50%) scale(1.6)}}
  .demo-hl{position:fixed;border:3px solid #ea580c;border-radius:8px;z-index:2147483645;pointer-events:none;
    box-shadow:0 0 0 4px rgba(234,88,12,.18);animation:hlin .5s ease}
  @keyframes hlin{from{opacity:0;transform:scale(1.15)}to{opacity:1;transform:scale(1)}}
  body.demo-zoom > *:not(#demo-cap):not(#demo-cur):not(.demo-hl):not(style){transition:transform .9s ease}`;
  const add = () => {
    if (document.getElementById('demo-cap')) return;
    const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);
    const c = document.createElement('div'); c.id = 'demo-cap'; c.textContent = ss.get('cap') || '';
    const k = document.createElement('div'); k.id = 'demo-cur';
    const pos = JSON.parse(ss.get('cur') || '[720,450]');
    k.style.left = pos[0] + 'px'; k.style.top = pos[1] + 'px';
    document.body.append(c, k);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', add); else add();
})();
"""

ZOOM_JS = """([sel, idx, scale]) => {
  const el = document.querySelectorAll(sel)[idx]; if (!el) return false;
  const r = el.getBoundingClientRect();
  scale = Math.max(1, Math.min(scale, 0.94 * innerWidth / r.width, 0.8 * innerHeight / r.height));
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  document.body.classList.add('demo-zoom');
  const kids = [...document.body.children].filter(k => !['demo-cap','demo-cur'].includes(k.id) && !k.classList.contains('demo-hl') && k.tagName !== 'STYLE' && k.tagName !== 'SCRIPT');
  const tx = innerWidth / 2 - cx, ty = innerHeight / 2 - cy - 40;
  kids.forEach(k => { k.style.transformOrigin = `${cx}px ${cy}px`; k.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`; });
  const cur = document.getElementById('demo-cur'); if (cur) cur.style.opacity = 0;
  return true;
}"""
UNZOOM_JS = """() => {
  [...document.body.children].forEach(k => { if (k.style && k.style.transform) k.style.transform = ''; });
  document.querySelectorAll('.demo-hl').forEach(h => h.remove());
  const cur = document.getElementById('demo-cur'); if (cur) cur.style.opacity = 1;
}"""
HL_JS = """([sel, text, pair]) => {
  const els = [...document.querySelectorAll(sel)].filter(e => e.textContent.trim() === text || (!pair && e.textContent.includes(text)));
  const el = els[els.length - 1]; if (!el) return false;
  let r = el.getBoundingClientRect();
  if (pair && el.nextElementSibling) {
    const n = el.nextElementSibling.getBoundingClientRect();
    r = {left: Math.min(r.left, n.left), top: Math.min(r.top, n.top), right: Math.max(r.right, n.right), bottom: Math.max(r.bottom, n.bottom)};
  }
  const h = document.createElement('div'); h.className = 'demo-hl';
  Object.assign(h.style, {left: (r.left - 8) + 'px', top: (r.top - 5) + 'px', width: (r.right - r.left + 16) + 'px', height: (r.bottom - r.top + 10) + 'px'});
  document.body.appendChild(h); return true;
}"""


def tts():
    VOICE.mkdir(exist_ok=True)
    durs = {}
    for k, text in LINES.items():
        f = VOICE / f"{VOICE_NAME}-{k}.mp3"
        if not f.exists():
            subprocess.run([sys.executable, "-m", "edge_tts", "--voice", VOICE_NAME, "--rate=+4%", "--text", text,
                            "--write-media", str(f)], check=True, capture_output=True)
        err = subprocess.run([FF, "-i", str(f)], capture_output=True, text=True).stderr
        m = re.search(r"Duration: (\d+):(\d+):([\d.]+)", err)
        durs[k] = int(m[1]) * 3600 + int(m[2]) * 60 + float(m[3])
    return durs


class Show:
    def __init__(self, pg, durs):
        self.pg, self.durs, self.t0, self.cues = pg, durs, time.monotonic(), []
        self.until = 0.0

    def say(self, key, cap=None):
        """Start narration line now; caption it. Returns when it is safe to move on via .finish()."""
        now = time.monotonic() - self.t0
        self.cues.append((key, now))
        self.until = now + self.durs[key] + 0.35
        self.caption(cap if cap is not None else "")

    def finish(self, extra=0.0):
        left = self.until + extra - (time.monotonic() - self.t0)
        if left > 0:
            self.pg.wait_for_timeout(int(left * 1000))

    def caption(self, text):
        self.pg.evaluate("t => { try{sessionStorage.setItem('cap', t)}catch(e){}; const c=document.getElementById('demo-cap'); if(c) c.textContent=t }", text)

    def move(self, loc):
        loc.scroll_into_view_if_needed()
        b = loc.bounding_box()
        x, y = b["x"] + b["width"] / 2, b["y"] + b["height"] / 2
        self.pg.evaluate("([x,y]) => { try{sessionStorage.setItem('cur', JSON.stringify([x,y]))}catch(e){}; const k=document.getElementById('demo-cur'); if(k){k.style.left=x+'px';k.style.top=y+'px'} }", [x, y])
        self.pg.wait_for_timeout(700)

    def click(self, loc, wait=800):
        self.move(loc)
        self.pg.evaluate("() => { const k=document.getElementById('demo-cur'); if(k){k.classList.remove('click'); void k.offsetWidth; k.classList.add('click')} }")
        self.pg.wait_for_timeout(250)
        loc.click()
        self.pg.wait_for_timeout(wait)

    def zoom(self, sel, scale, idx=0):
        self.pg.evaluate(ZOOM_JS, [sel, idx, scale])
        self.pg.wait_for_timeout(1000)

    def unzoom(self):
        self.pg.evaluate(UNZOOM_JS)
        self.pg.wait_for_timeout(950)

    def hl(self, sel, text, pair=False):
        self.pg.evaluate(HL_JS, [sel, text, pair])
        self.pg.wait_for_timeout(500)

    def settle(self, ms=600):
        self.pg.wait_for_load_state("networkidle")
        self.pg.wait_for_timeout(ms)

    def card(self, title, sub):
        self.pg.set_content(f"""<html><body style="margin:0;height:100vh;display:flex;align-items:center;justify-content:center;
          background:#faf6f1;font-family:system-ui,Segoe UI,sans-serif;color:#1c1917">
          <div style="max-width:1050px;text-align:center;padding:40px">
          <div style="font-size:22px;font-weight:700;letter-spacing:.04em;color:#c2410c;margin-bottom:22px">LEVY DESK</div>
          <div style="font-size:50px;font-weight:700;line-height:1.2">{title}</div>
          <div style="font-size:26px;margin-top:26px;color:#57534e;line-height:1.5">{sub}</div></div></body></html>""")


def record(durs):
    if RAW.exists():
        shutil.rmtree(RAW)
    with sync_playwright() as p:
        b = p.chromium.launch()
        c0 = b.new_context(viewport={"width": W, "height": H})
        lp = c0.new_page()
        lp.goto(f"{BASE}/login"); lp.fill("input[type=email]", "demo@levydesk.test")
        lp.click('button:has-text("Sign in")'); lp.wait_for_url("**/dashboard")
        for path in ["/dashboard", "/imports/new", "/bookings", "/exceptions", "/returns", "/returns/new", "/properties"]:
            lp.goto(BASE + path); lp.wait_for_load_state("networkidle")
        state = c0.storage_state(); c0.close()

        ctx = b.new_context(viewport={"width": W, "height": H}, storage_state=state,
                            record_video_dir=str(RAW), record_video_size={"width": W, "height": H})
        ctx.add_init_script(OVERLAY)
        pg = ctx.new_page()
        s = Show(pg, durs)
        pg.wait_for_timeout(600)

        # 1 intro card
        s.card("Your clients' visitor levy figures,<br>from their Airbnb and Booking.com exports",
               "Edinburgh now. Glasgow from 25 January.<br>Every figure checked against the council's own guidance.")
        s.say("intro"); s.finish(0.4)

        # 2 dashboard
        pg.goto(f"{BASE}/dashboard"); s.settle(300)
        s.say("dash", "Demo letting agent: 3 owners, 4 properties. All names are made up.")
        s.finish()

        # 3 upload
        pg.goto(f"{BASE}/imports/new"); s.settle(300)
        s.say("upload", "Upload an owner's Airbnb export. Nothing to retype.")
        sel = pg.locator("select").nth(0); s.move(sel); sel.select_option(label="Leith Shore Flat"); pg.wait_for_timeout(500)
        sel2 = pg.locator("select").nth(1); s.move(sel2); sel2.select_option(value="AIRBNB"); pg.wait_for_timeout(500)
        f = pg.locator("input[type=file]"); s.move(f); f.set_input_files(str(DATA / "01-leith-shore-flat-airbnb.csv"))
        s.finish()
        s.click(pg.locator("button:has-text('Upload and map columns')"), 300)
        pg.wait_for_selector("button:has-text('Import bookings')"); s.settle(300)
        s.say("map", "Airbnb and Booking.com columns are matched automatically.")
        s.zoom("main form > div", 1.25, 0)  # mapping table
        s.finish(0.3)
        s.unzoom()
        s.click(pg.locator("button:has-text('Import bookings')"), 300)
        pg.wait_for_url("**/results"); s.settle(300)
        s.say("results", "17 bookings imported, 0 errors.")
        s.zoom("main", 1.0)  # no-op zoom keeps layout; just highlight stats
        s.hl("main *", "Imported")
        s.finish(0.5); s.unzoom()

        # 4 working for 7-night stay
        pg.goto(f"{BASE}/bookings"); s.settle(300)
        row = pg.locator("tr", has_text="Leith Shore Flat").filter(has_text="2026-10-09").first
        row.scroll_into_view_if_needed(); pg.wait_for_timeout(400)
        s.click(row.locator("button:has-text('Show working')"), 700)
        s.say("working", "7-night stay: levy on the first 5 nights only. The cleaning fee counts, per the council's guidance.")
        s.zoom("[role=dialog]", 1.3)
        s.hl("[role=dialog] span", "Total nights", pair=True)
        s.hl("[role=dialog] span", "Nights charged", pair=True)
        pg.wait_for_timeout(2500)
        s.hl("[role=dialog] li", "One-off fees charged in full")
        s.hl("[role=dialog] span", "Levy", pair=True)
        s.finish(0.6)
        s.unzoom(); pg.keyboard.press("Escape"); pg.wait_for_timeout(500)

        # 5 exceptions
        s.click(pg.locator("a[href='/exceptions']").first, 300); s.settle(300)
        ex = pg.locator("text=Booked before 1 October 2025").first
        s.click(ex, 700)
        s.say("exceptions", "Anything uncertain is flagged for you to check, not guessed.")
        card = pg.locator("main").locator("div", has_text="Royal Mile Studio").filter(has_text="payment date needed").last
        card_sel_idx = pg.evaluate("() => { const all=[...document.querySelectorAll('main div')]; const c=all.filter(d=>d.textContent.includes('Royal Mile Studio')&&d.textContent.includes('payment date needed')); return all.indexOf(c[c.length-1]) }")
        s.zoom("main div", 1.3, card_sel_idx)
        s.finish(0.5); s.unzoom()

        # 6 return
        pg.goto(f"{BASE}/returns/new"); s.settle(300)
        s.say("return1", "Generate the quarter's return.")
        s1 = pg.locator("select").nth(0); s.move(s1); s1.select_option(label="City of Edinburgh"); pg.wait_for_timeout(900)
        s2 = pg.locator("select").nth(1); s.move(s2); s2.select_option(value="2026-Q4"); pg.wait_for_timeout(400)
        s.finish()
        s.click(pg.locator("button:has-text('Generate return')"), 300)
        pg.wait_for_url("**/returns/c*"); s.settle(300)
        s.say("return2", "Edinburgh, Oct to Dec: the figures for visitorlevy.scot, due 30 January.")
        idx = pg.evaluate("() => { const all=[...document.querySelectorAll('main div')]; const c=all.filter(d=>d.textContent.includes('Levy due')&&d.textContent.includes('Net payable')); return all.indexOf(c[c.length-1]) }")
        s.zoom("main div", 1.25, idx)
        s.hl("main div", "Net payable to council")
        s.finish(0.6); s.unzoom()

        # 7 owner statement
        pg.goto(f"{BASE}/properties"); s.settle(300)
        s.click(pg.locator("tr", has_text="Leith Shore Flat").locator("a:has-text('Statement')"), 300); s.settle(300)
        v = pg.locator("button:has-text('View'), a:has-text('View')").first
        if v.count():
            s.click(v, 300); s.settle(300)
        s.say("statement", "A statement for each property, ready to send to its owner.")
        idx = pg.evaluate("() => { const all=[...document.querySelectorAll('main div')]; const c=all.filter(d=>d.textContent.includes('SUMMARY')||d.textContent.includes('Summary')).filter(d=>d.textContent.includes('Net levy payable')); return all.indexOf(c[c.length-1]) }")
        s.zoom("main div", 1.2, idx)
        s.finish(0.5); s.unzoom()

        # 8 Glasgow
        pg.goto(f"{BASE}/bookings"); s.settle(300)
        row = pg.locator("tr", has_text="Merchant City Loft").filter(has_text="2027-02-06").first
        row.scroll_into_view_if_needed(); pg.wait_for_timeout(400)
        s.click(row.locator("button:has-text('Show working')"), 700)
        s.say("glasgow", "Glasgow from 25 January: no night cap, so all 7 nights count. You keep 1.5%.")
        s.zoom("[role=dialog]", 1.3)
        s.hl("[role=dialog] span", "Nights charged", pair=True)
        pg.wait_for_timeout(3000)
        s.hl("[role=dialog] span", "Retention (kept)", pair=True)
        s.finish(0.4); s.unzoom(); pg.keyboard.press("Escape"); s.caption("")

        # 9 end card
        s.card("I'll set up your owners for free<br>before the 30 January return.",
               "Reply to my email with one owner's Airbnb or Booking.com export.<br>"
               "After that, £25 a month including 5 units, then £5 per unit.<br><br>"
               "<b>levydesk.co.uk</b> · Reece Crowther")
        s.say("end"); s.finish(1.5)

        video = pg.video.path()
        ctx.close(); b.close()
    (HERE / "cues.json").write_text(json.dumps(s.cues))
    return Path(video), s.cues


def mix(video, cues):
    out = OUTDIR / f"levy-desk-walkthrough-voice-{VOICE_NAME.split('-')[2].replace('Neural','').lower()}.mp4"
    args = [FF, "-y", "-loglevel", "error", "-i", str(video)]
    filt = []
    for i, (k, t) in enumerate(cues):
        args += ["-i", str(VOICE / f"{VOICE_NAME}-{k}.mp3")]
        ms = int(t * 1000)
        filt.append(f"[{i+1}:a]adelay={ms}|{ms},volume=1.0[a{i}]")
    filt.append("".join(f"[a{i}]" for i in range(len(cues))) + f"amix=inputs={len(cues)}:normalize=0[aout]")
    args += ["-filter_complex", ";".join(filt), "-map", "0:v", "-map", "[aout]",
             "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20", "-c:a", "aac", "-b:a", "160k",
             "-movflags", "+faststart", "-shortest", str(out)]
    subprocess.run(args, check=True)
    return out


if __name__ == "__main__":
    durs = tts()
    print("narration seconds:", round(sum(durs.values()), 1))
    video, cues = record(durs)
    print("mixed:", mix(video, cues))
