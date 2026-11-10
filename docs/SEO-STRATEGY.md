# Levy Desk: SEO strategy

**Written:** 10 November 2026, using Search Console (19 Oct to 8 Nov 2026) and Google Analytics (property "LevyDesk", G-WVZC9WRDDT).
**Review:** monthly, and fully after the 30 January 2027 deadline.

---

## 1. Where we are now

### Search Console (first 3 weeks of data)

| Metric | Value |
|---|---|
| Clicks | 5 |
| Impressions | 175 |
| Average position | 15 |
| Indexed pages | 12 (the 3 "not indexed" are redirects, which is fine) |

**Pages**

| Page | Clicks | Impressions | Position |
|---|---|---|---|
| /edinburgh-visitor-levy/how-to-file | 1 | 65 | **7.3** |
| /edinburgh-visitor-levy | 2 | 43 | 22.9 |
| / (home) | 2 | 29 | 26.0 |
| /glasgow-visitor-levy | 0 | 14 | **6.1** |
| /edinburgh-visitor-levy/what-if-i-miss-the-deadline | 0 | 8 | **5.5** |
| /visitor-levy-tracker | 0 | 8 | 17.4 |
| /edinburgh-visitor-levy/airbnb-hosts | 0 | 8 | 26.6 |
| /cardiff-tourism-levy | 0 | 5 | 7.4 |
| /glasgow-visitor-levy/how-to-file | 0 | 3 | 6.0 |

**Queries:** "edinburgh visitor levy" (17 impressions, position 32), "holiday let tax scotland tax calculator" (9, position 68), "visitor levy scotland" (5, position 19), "edinburgh visitor levy portal" (3, position 8.7), "edinburgh visitor levy airbnb" (3, position 81), "edinburgh visitor levy calculator" (1 click).

### Analytics

- Around 7 users a week, almost all "direct" (including Reece's own visits from Formby).
- **0 key events.** Calculator reminder sign-ups and new accounts are not tracked, so we can't tell which pages produce leads.
- Search Console is **not linked** to Analytics.

### Who we're up against in search results

Council pages (edinburgh.gov.uk, glasgow.gov.uk), VisitScotland, law and accountancy firms (Anderson Strathern, DWF, ICAS), booking software blogs (freetobook, Bookster, Hop, RoomMaster), and news sites. Nobody has a page aimed at **letting agents managing many owners**. That gap is ours.

### Honest assessment

The site is young, its technical SEO is sound, and several pages already sit on page 1 (positions 5 to 8) for low-volume searches. The search market is **small and seasonal**, with spikes before each quarterly deadline. SEO will not reach £3k a month on its own. It is a slow, compounding second channel behind direct outreach (confidence about 80/100). Treat it as "be the trusted answer when agents and hosts search", not as the growth engine.

---

## 2. Goals to 31 January 2027

| Goal | Target | Why |
|---|---|---|
| Lead tracking working | Key events live by 20 Nov | Without it, every decision below is a guess |
| Clicks | 100+ in the 30 days before 30 Jan | The first real deadline spike |
| Calculator reminder sign-ups | 30+ | These feed the January reminder email |
| Glasgow pages | Top 5 for "glasgow visitor levy" before 25 Jan | New scheme, new searches, little competition yet |
| An agent landing page indexed | By 1 Dec | The audience that actually pays |

These targets are guesses (confidence about 40/100). Reset them in February using real data.

---

## 3. Priorities, in order

### P1. Measure (this week, about 1 hour)

1. Add GA4 key events for **calculator reminder sign-up**, **account created** and **import completed**. This is a small code change using the existing gtag.
2. Link Search Console to Analytics (Admin, then Product links). This is a settings change in your Google account, so do it yourself or ask me to do it with your OK.
3. Leave out Reece's own visits: add an internal-traffic filter for your IP, or use a browser where you've opted out.

### P2. Get more clicks from pages already on page 1 (this week)

Pages at positions 5 to 8 with almost no clicks usually have titles and descriptions that don't match what the searcher wanted.

- **/edinburgh-visitor-levy/how-to-file** (65 impressions, position 7, 1.5% click rate). Rewrite the title around the deadline and the portal, for example "How to file your Edinburgh visitor levy return (due 30 Jan 2027)". Mention visitorlevy.scot in the description, since people search "edinburgh visitor levy portal".
- **/glasgow-visitor-levy** (position 6). Lead with "starts 25 January 2027" and "1.5% retention" in the title and description.
- **/edinburgh-visitor-levy/what-if-i-miss-the-deadline** (position 5.5). Make the title answer the fear directly: penalties, interest, what to do now.
- **Accuracy pass on every page** before any promotion. The Glasgow page had two contradictions (fixed 10 Nov 2026). Our selling point is "checked against the council's guidance", so one wrong page undermines everything. Check each page against docs/RULES.md and add the "last checked" date it shows.

### P3. Build pages for the people who pay (November and December)

1. **/letting-agents**: "Visitor levy returns for letting agents and short-let managers". Cover multiple owners, Airbnb and Booking.com imports, owner statements, Edinburgh and Glasgow together, done-for-you setup, and pricing. Embed the walkthrough video. Use it as the link in outreach emails too.
2. **/accountants**: "Visitor levy figures for your holiday-let clients". Cover free read-only access, how the calculation is checked, and a downloadable one-page method sheet.
3. **Comparison pages**, written fairly. "Levy Desk vs a spreadsheet" and "Levy Desk vs the visitorlevy.scot calculator". People compare before they buy. Be honest about when they don't need us (a single host with a few bookings).

### P4. Answer the exact questions people search (one page every 1 to 2 weeks)

Short, council-referenced answer pages. Each one links to the calculator and the agent page. Our advantage is that we cite the council's guidance and show the working, and nobody else does.

| Question page | Why |
|---|---|
| Does Booking.com (or Airbnb) pay the Edinburgh visitor levy for me? | Very common misunderstanding; confirmed in the council guidance |
| Is the cleaning fee included in the visitor levy? | Same |
| Which quarter does a stay over New Year go in? | Timely for the Q4 return |
| Visitor levy and VAT: what VAT-registered hosts must do | Higher-value hosts and agents |
| Bookings made before October 2025: when they're exempt | Payment-date rule trips people up |
| Glasgow vs Edinburgh visitor levy: the differences | Agents with lets in both cities |

### P5. Follow the calendar

| When | Action |
|---|---|
| Early December | Refresh the Glasgow pages and add "How to register for the Glasgow levy" |
| Early January | Refresh "Edinburgh Q4 return due 30 January" across pages and the home page |
| Late January | A "Glasgow levy is now live: first return due 30 April" update |
| Each quarter | Update deadline dates on every page, 4 to 6 weeks before each deadline |
| As each new council is verified (Aberdeen and others) | Add its page the same week. Being first and accurate wins early rankings |

### P6. Earn a few good links (ongoing, low volume)

- An ASSC member resource or guest article, if allowed.
- Accountants who find the method sheet useful may link to it.
- Answer questions in host communities with genuinely useful replies. Links are a side effect, not the aim.
- Avoid paid links and directories. They aren't worth the risk.

---

## 4. What not to do

- Mass-produced AI blog posts. A small, accurate site beats a big generic one in a regulatory niche.
- Pages for councils whose rules aren't verified. Mark anything unverified clearly, or leave it out.
- Chasing high-volume tourist searches ("Edinburgh tourist tax"). Those are visitors, not hosts or agents.

---

## 5. Monthly routine (about 1 hour, mostly Claude)

1. Pull Search Console data: queries, pages and positions, compared with last month.
2. Pull Analytics key events by landing page.
3. Pick 1 or 2 title or description changes for pages at positions 4 to 15.
4. Write 1 or 2 new answer pages from the P4 list, or from new queries that appear.
5. Run an accuracy check of all pages against RULES.md.

This can run as a scheduled task that writes a short monthly SEO report to docs/.
