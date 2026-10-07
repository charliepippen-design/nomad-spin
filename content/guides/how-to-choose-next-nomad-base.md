## You're not bad at travel planning. You're missing a decision order

Most remote workers who say "I don't know where to go next" already have too much information, not too little. Saved Instagram Reels, half-finished Nomad List tabs, a friend hyping Lisbon, another friend recovering from Bali traffic, and zero shared framework for weighing any of it.

The stuck feeling is usually a sequencing problem. People compare vibes before they lock a budget. They research digital nomad visas before they know whether they need 30 days or 180. They open a ranked "best places" list before they've defined what "best" means for *their* work week.

This guide is a decision order, not another ranking. It maps the five constraints that actually decide whether a base works onto Nomad Spin's real filters, then shows you how to turn a spin into a shortlist of destination pages and (only after that) a booking. Nomad Spin scores **780+ cities** on cost, internet, safety, vibe, landscape, region, and visa data; the point of this article is to use those fields on purpose instead of spinning at random.

If you already know you want a deep dive on a specific hub, skip ahead to [Living in Bali](/guides/living-in-bali), [Living in Bangkok](/guides/living-in-bangkok), [Living in Barcelona](/guides/living-in-barcelona), [Living in Budapest](/guides/living-in-budapest), [Living in Buenos Aires](/guides/living-in-buenos-aires), [Living in Cape Town](/guides/living-in-cape-town), [Living in Chiang Mai](/guides/living-in-chiang-mai), [Living in Da Nang](/guides/living-in-da-nang), [Living in Ho Chi Minh City](/guides/living-in-ho-chi-minh-city), [Living in Hoi An](/guides/living-in-hoi-an), [Living in Lisbon](/guides/living-in-lisbon), [Living in Medellin](/guides/living-in-medellin), [Living in Mexico City](/guides/living-in-mexico-city), [Living in Porto](/guides/living-in-porto), [Living in Prague](/guides/living-in-prague), [Living in Tbilisi](/guides/living-in-tbilisi), or [Living in Valencia](/guides/living-in-valencia). If you want a ranked shortlist *after* you've set constraints, use [Best Places for Digital Nomads in 2026](/guides/best-places-digital-nomads-2025). This page is what to do when you still don't know which of those paths fits.

## The five constraints that actually matter (and map to Spin)

Every workable nomad base fails or succeeds on a small set of hard constraints. Soft preferences only matter once those are honest.

### 1. Budget ceiling → cost fields

Spin filters on a monthly **budget range**. The city field that matches it is `costUSD` (same number as `financials.costNomadSingle` for a solo nomad month). That figure is a planning baseline (rent, food, local transport, and typical coworking) not a promise that your Airbnb will match it.

Use the supporting financials when you're comparing *how* you'd stay:

- `financials.costLongTerm`: what a longer lease or local-rate month tends to look like vs a scouting month
- `financials.airbnbMedian`: nightly scouting cost when you're still testing a neighborhood
- `financials.rentIndex`: relative rent pressure vs other cities in the dataset

Concrete anchors from the dataset (solo nomad monthly `costUSD`): [Da Nang](/destinations/da-nang) at **$700** ([living guide](/guides/living-in-da-nang)), [Chiang Mai](/destinations/chiang-mai) at **$850**, [Tbilisi](/destinations/tbilisi) at **$800**, [Ho Chi Minh City](/destinations/ho-chi-minh-city) at **$800** ([living guide](/guides/living-in-ho-chi-minh-city)), [Buenos Aires](/destinations/buenos-aires) at **$900** ([living guide](/guides/living-in-buenos-aires)), [Mexico City](/destinations/mexico-city) at **$1,300**, [Budapest](/destinations/budapest) at **$1,500** ([living guide](/guides/living-in-budapest)), [Prague](/destinations/prague) at **$1,700** ([living guide](/guides/living-in-prague)), [Porto](/destinations/porto) at **$1,800** ([living guide](/guides/living-in-porto)), [Valencia](/destinations/valencia) at **$1,900** ([living guide](/guides/living-in-valencia)), [Lisbon](/destinations/lisbon) at **$2,200**, [Barcelona](/destinations/barcelona) at **$2,500** ([living guide](/guides/living-in-barcelona)). If your real ceiling is $1,400 and you keep "maybe Lisbon" in the pile without raising the budget slider, you're arguing with yourself, not researching.

### 2. Work reliability → internet and infrastructure

Meetings don't care about your sunset photos. Spin's **minimum internet** preference scores against `internetMbps` (aligned with `infra.internetSpeedAvg`). The fields that catch people who only look at headline Mbps are:

- `infra.internetReliability` (1–10): how often the connection you paid for actually holds
- `infra.powerGridStability` (1–10): load shedding and brownouts kill calls as fast as bad Wi‑Fi
- `infra.coworkingDensity` (`High` / `Med` / `Low`): whether you have a fallback room when home internet fails

Lisbon posts **200 Mbps** with reliability **9** and power **9**. The [Lisbon living guide](/guides/living-in-lisbon) is where the $2,200 band, the neighborhoods, and the D8 paperwork show up, which the Mbps figure does not. Porto posts the same **200 Mbps**, reliability **9**, and power **9**, with coworking **Med** and safety **9.0**; the [Porto living guide](/guides/living-in-porto) is where the $1,800 band, Cedofeita versus Bonfim, and the wet-winter trade-off show up, which the Mbps figure does not. Budapest posts the same **200 Mbps**, reliability **9**, and power **9** at **$1,500**. The [Budapest living guide](/guides/living-in-budapest) is where District VII versus Buda, winter, and the White Card show up, which the Mbps figure does not. Prague posts the same **200 Mbps**, reliability **9**, and power **9**, with coworking **High**, at **$1,700**, and safety **8.8**. The [Prague living guide](/guides/living-in-prague) is where Vinohrady versus Old Town, cold winters, and the freelancer-versus-employee visa fork show up, which the Mbps figure does not. Cape Town can show **100 Mbps** on paper while `powerGridStability` sits at **4**: which is why the [Cape Town living guide](/guides/living-in-cape-town) spends real space on UPS and coworking fallbacks. Bali averages **50 Mbps** with reliability **5**; the [Bali living guide](/guides/living-in-bali) is blunt about street-by-street fiber and backup SIMs. Chiang Mai averages **95 Mbps** with reliability **8** and power **8**; the [Chiang Mai living guide](/guides/living-in-chiang-mai) is where neighborhood choice and burning season show up, which the Mbps figure does not. Mexico City averages **90 Mbps** with reliability **7** and power **7**; the [Mexico City living guide](/guides/living-in-mexico-city) is where altitude, air quality, and Roma versus Condesa show up, which the Mbps figure does not. Da Nang averages **80 Mbps** with reliability **7** and power **7**; the [Da Nang living guide](/guides/living-in-da-nang) is where An Thuong versus Hai Chau and the Sep-Dec typhoon window show up, which the Mbps figure does not. Ho Chi Minh City averages **85 Mbps** with reliability **7** and power **7**, coworking **High**; the [Ho Chi Minh City living guide](/guides/living-in-ho-chi-minh-city) is where District 1 versus Thao Dien, traffic, and the Dec-Apr dry season show up, which the Mbps figure does not. Hoi An averages **80 Mbps** with reliability **7** and power **7**, and coworking density **Low**; the [Hoi An living guide](/guides/living-in-hoi-an) is where Old Town versus An Bang and the Sep-Nov flood window show up, which the Mbps figure does not. Medellin averages **80 Mbps** with reliability **7** and power **7**; the [Medellin living guide](/guides/living-in-medellin) is where Laureles versus El Poblado, Spanish, and the safety scores show up, which the Mbps figure does not. Bangkok averages **120 Mbps** with reliability **8** and power **8**; the [Bangkok living guide](/guides/living-in-bangkok) is where BTS neighborhood choice, heat, and traffic show up, which the Mbps figure does not. Tbilisi averages **60 Mbps** with reliability **7** and power **7**, and coworking density **Med**; the [Tbilisi living guide](/guides/living-in-tbilisi) is where the 365-day visa-free field, winter, and that Med coworking map show up, which the Mbps figure does not. Barcelona averages **300 Mbps** with reliability **9** and power **9**, coworking **High**; the [Barcelona living guide](/guides/living-in-barcelona) is where the $2,500 band, the rent, and the cheaper-peer decision show up, which the Mbps figure does not. Valencia averages **170 Mbps** with reliability **9** and power **9**, coworking **Med**; the [Valencia living guide](/guides/living-in-valencia) is where the $1,900 band, Ruzafa versus Cabanyal, and the October flood calendar show up, which the Mbps figure does not. Buenos Aires averages **70 Mbps** with reliability **6** and power **6**, and coworking density **Med**; the [Buenos Aires living guide](/guides/living-in-buenos-aires) is where inflation, Palermo versus Villa Crespo, and that reliability score show up, which the Mbps figure does not. If your job is meeting-heavy, treat reliability and power as hard filters, not footnotes.

### 3. Personal safety floor → safety scores

Spin's **minimum safety** maps to the city's overall `safety` score (roughly 1–10). Dig one layer deeper with `vibeMetrics.femaleSafety` and `vibeMetrics.lgbtFriendly` when those are non‑negotiable for you, a city can score decently overall and still be a poor fit for your situation.

Examples from verified rows: Porto `safety` **9.0** (femaleSafety **9**, lgbtFriendly **8**); Lisbon **8.8** (femaleSafety **8**, lgbtFriendly **9**); Chiang Mai **8.2** / **8** / **6**; Mexico City **6.0** / **5** / **7**; Medellín **6.5** / **5** / **6**; Buenos Aires **6.2** / **5** / **8**; Cape Town **5.5** / **4** / **7**. A lower score is not "never go", it's "budget for location choice, transport habits, and neighborhood research before you book three months."

### 4. Place feel → vibe and landscape

Once budget, internet, and safety clear the bar, dial soft preferences: `vibe[]` tags (e.g. `workhub`, `beach`, `party`, `mountain`, `foodie`, `adventure`) and `landscape[]` (`seaside`, `mountain`, `urban`, `rural`, `island`, `desert`). Spin also scores nightlife vs focus via `vibeMetrics.nightlife` and how plugged-in the scene feels via `vibeMetrics.communitySize`.

Chiang Mai leans `workhub` + `mountain` with nightlife **5** and community **9**, productive and social without a beach. Budapest leans `party` + `workhub` with nightlife **9**. If you keep selecting "quiet deep work" in your head but leave nightlife unconstrained in the UI, Spin will happily serve party hubs that match your other numbers.

### 5. Stay friction → visa, timezone, language

The constraint people romanticize and under-specify: how long you can legally stay, and how annoying daily life will be.

- `meta.visaType` + `meta.visaDays` (also mirrored on `visa.type` / `visa.days`): exemption, visa on arrival, digital nomad visa, visa-free, etc.
- `meta.timeZoneUtc`: brutal if you have fixed US or EU standup hours
- `language`: daily friction outside coworking English bubbles

Tbilisi: **Visa Free**, **365** days, `UTC+4`. Lisbon and Budapest: **Digital Nomad Visa**, **365** days. For Lisbon that 365 is the initial visa field, not a visa-free year; the residence permit path is longer (see the Lisbon guide). For Budapest that field is Hungary's White Card, and the official income pages do not currently match (see the [Budapest living guide](/guides/living-in-budapest)). Prague: **Freelance Visa**, **365** days, `UTC+1`. That field is not a digital nomad visa you collect on arrival. It points at a trade-licence path, and Czechia also runs a separate Digital Nomad Program for some passports (see the [Prague living guide](/guides/living-in-prague)). Valencia and Barcelona list the same **Digital Nomad Visa**, **365** days. For those rows the 365 is Spain's consular telework visa, and the in-Spain residence permit can run up to 3 years (see the [Valencia living guide](/guides/living-in-valencia)). Mexico City: **Visa Exemption**, **180** days. Medellín: **Visa Exemption**, **90** days, `UTC-5` (see the [Medellin living guide](/guides/living-in-medellin)). Buenos Aires: **Visa Exemption**, **90** days, `UTC-3` (see the [Buenos Aires living guide](/guides/living-in-buenos-aires)). The longer remote-work route there is a separate Migraciones file. Chiang Mai and Bangkok: **Tourism Visa Exemption**, **30** days (passport-dependent, tourism only; the DTV is the long-stay path; see the [Bangkok living guide](/guides/living-in-bangkok)). Bali: **Visa on Arrival**, **30** days (extensions and longer stays are a separate planning problem, see the Bali guide). Ho Chi Minh City and Da Nang: **E-Visa**, **90** days (no dedicated digital nomad visa; see the living guides). A beautiful city with 30 visa days is a different product than the same city with a year-long route.

When a row is marked `dataSource: "estimated"` instead of `"verified"`, treat the numbers as directional and verify before you commit deposit money.

## A simple scoring order (do this before you open Instagram)

1. **Lock non‑negotiables**: monthly budget ceiling, minimum Mbps you actually need for your job, minimum safety score you'll accept, and minimum visa days for this trip.
2. **Add soft preferences**: region, landscape, vibe tags, nightlife tolerance.
3. **Only then** read `pros` / `cons` and open destination pages for lifestyle tradeoffs.

Reversing that order is how people fall in love with a reel, then discover the city is $800 over budget with 40 Mbps and a 30-day stamp.

On Nomad Spin, that sequence is literal: open preferences on the [home page](/), set the hard sliders first, then region/vibe/landscape, *then* spin. Hard filters (region, landscape, budget band) narrow the pool; internet and safety heavily influence the match score inside that pool.

## Three undecided personas → Spin presets

The preferences drawer ships three quick presets. Use them as starting points, then tighten one slider at a time.

### Budget-first explorer → Budget Saver

**Preset:** budget **$500–$1,500**, internet min **20** Mbps, safety min **5**, all regions.

Who it's for: you're flexible on nightlife and scenery; the month has to fit a lean burn rate. Expect the pool to lean toward places like Chiang Mai (~$850 / 95 Mbps / safety 8.2) or Tbilisi (~$800 / 60 Mbps / safety 8.0). After a spin, open the destination page and check `costLongTerm` vs `airbnbMedian` so you're not planning a three-month stay on scouting-night prices.

### Meeting-heavy remote worker → High Comfort

**Preset:** budget **$1,500–$5,000**, internet min **150** Mbps, safety min **8**.

Who it's for: video calls are the job. Headline tourism rankings matter less than `internetMbps`, `internetReliability`, and `powerGridStability`. Lisbon (~$2,200 / **200** Mbps / safety **8.8**) and Budapest (~$1,500 / **200** Mbps / safety **8.3**) sit naturally in this band. If High Comfort returns almost nothing, loosen *one* constraint (usually the safety floor by a point, or the internet floor from 150 to 100) rather than widening everything at once.

### Quiet deep-work month → Quiet / Productive

**Preset:** budget **$500–$3,000**, internet min **50**, safety min **6**, vibes tagged toward **workhub** / **mountain**, low-nightlife intent.

Who it's for: you want fewer party defaults. Watch `vibeMetrics.nightlife` on the result: Chiang Mai at **5** fits the brief better than Budapest at **9**, even when both clear a mid budget. If you still land party-tagged cities, add an explicit landscape (e.g. `mountain`) or remove `party` from your mental shortlist and re-spin.

None of these presets replace reading the destination page. They only stop you from spinning with an empty preference set and calling the result "research."

## How to read a spin result without overthinking

A spin returns a primary city plus near alternatives, each with a **match score** against your preferences. Treat the score as "how well this row fits the filters you set," not as a moral ranking of cities.

**Open the destination page** (`/destinations/{slug}`) when:

- Hard numbers clear your floors (cost, Mbps, safety, visa days)
- You need `pros` / `cons`, weather months, or timezone detail before deciding
- You're comparing two cities that scored similarly

**Spin again** when:

- The result fails a non‑negotiable you forgot to encode (e.g. you need `UTC-5` to `UTC-8` overlap and got `UTC+7`)
- You realize a soft preference is actually hard (no beach → set landscape; no big party scene → raise the quiet intent)
- The pool feels identical three times in a row: loosen one slider 10–20% and retry

Example path: Budget Saver → land on Chiang Mai → read [Chiang Mai](/destinations/chiang-mai) and the [living guide](/guides/living-in-chiang-mai) → note burning season in `cons` and best months Nov–Feb → either accept that calendar or re-spin with a different region for your travel window.

## Compare without a spreadsheet

Save **two or three** spins (or keep three destination tabs) and compare only the columns that decide bookings:

| Field | Why it matters |
|---|---|
| `costUSD` vs your ceiling | Immediate yes/no |
| `internetMbps` + reliability / power | Call risk |
| `safety` (+ femaleSafety / lgbtFriendly if relevant) | Daily stress |
| `meta.visaDays` / `visaType` | Trip length |
| `meta.timeZoneUtc` | Meeting sanity |
| `pros` / `cons` | Lifestyle vetoes |

Ignore aesthetic rankings until those six agree. A city can win Instagram and still fail timezone or visa days.

Useful canonical pages for a first comparison set: [Chiang Mai](/destinations/chiang-mai), [Lisbon](/destinations/lisbon), [Tbilisi](/destinations/tbilisi), [Mexico City](/destinations/mexico-city), [Budapest](/destinations/budapest). If Lisbon survives the budget filter, read [Living in Lisbon](/guides/living-in-lisbon) before you pay a deposit. If Budapest survives it, read [Living in Budapest](/guides/living-in-budapest) before you pay a deposit. If Prague survives it, read [Living in Prague](/guides/living-in-prague) before you pay a deposit. Add [Bali](/destinations/bali) or [Cape Town](/destinations/cape-town) only when your filters (and appetite for traffic or load shedding) actually point there, then read the living guides before you pay a deposit.

## Common failure modes

**Optimizing for vibe before budget.** You fall for a beach tag, then discover `costUSD` is $900 over your ceiling. Fix: set budget range first; let vibe rank *inside* the affordable pool.

**Ignoring power and internet reliability.** Mbps looks fine; `powerGridStability` or `internetReliability` does not. Fix: for meeting-heavy work, treat those infra fields as hard filters equal to speed.

**Visa daydreaming without `visaDays`.** "Digital nomad friendly" is not a length of stay. Fix: require a minimum day count in your head (30 / 90 / 180 / 365) and check `meta.visaType` on the destination page every time.

**Using a ranked list as a substitute for preferences.** Lists answer "what scores well generally." They do not answer "what fits *my* $1,200 / 80 Mbps / safety 7 / 90-day trip." Read [Best Places 2026](/guides/best-places-digital-nomads-2025) *after* you've set those numbers, or use it only to discover candidates to plug into Spin.

**Treating estimated rows like verified ones.** If `dataSource` is estimated, verify rent and visa rules before you wire money.

## Do this next

1. Open Nomad Spin on the [home page](/) and set budget, internet minimum, and safety minimum: the three non‑negotiables.
2. Optionally apply a preset (Budget Saver, High Comfort, or Quiet / Productive), then adjust one slider.
3. Spin once. Open the linked `/destinations/...` page. Check cost, Mbps, safety, visa days, timezone, and cons.
4. Save a second and third spin with **one** constraint loosened each time. Compare side by side.
5. When a city survives that process, read a deep guide if we have one ([Bali](/guides/living-in-bali), [Bangkok](/guides/living-in-bangkok), [Barcelona](/guides/living-in-barcelona), [Budapest](/guides/living-in-budapest), [Buenos Aires](/guides/living-in-buenos-aires), [Cape Town](/guides/living-in-cape-town), [Chiang Mai](/guides/living-in-chiang-mai), [Da Nang](/guides/living-in-da-nang), [Ho Chi Minh City](/guides/living-in-ho-chi-minh-city), [Hoi An](/guides/living-in-hoi-an), [Lisbon](/guides/living-in-lisbon), [Medellin](/guides/living-in-medellin), [Mexico City](/guides/living-in-mexico-city), [Porto](/guides/living-in-porto), [Prague](/guides/living-in-prague), [Tbilisi](/guides/living-in-tbilisi), [Valencia](/guides/living-in-valencia)) or proceed from the destination page and current official visa sources.

You don't need a perfect ranking of 780+ cities. You need a repeatable filter → spin → destination-page loop that stops the tab-hoarding and produces one base you can actually book.

*Last updated: October 2026. Costs, visa rules, and infrastructure scores change; always confirm official sources and current listings before you travel.*
