import { contentGuides } from './contentGuides.generated';

export interface Guide {
  id: string;
  slug: string;
  title: string;
  /** Optional shorter/SEO-tuned <title>; falls back to `title`. */
  seoTitle?: string;
  excerpt: string;
  /** Publication date (YYYY-MM-DD or ISO). */
  date: string;
  /** Last substantive update (YYYY-MM-DD or ISO); falls back to `date`. */
  updated?: string;
  readTime: string;
  /** Destination slugs (see src/lib/slugify.ts → citySlug) this guide is about. */
  relatedDestinations?: string[];
  /** HTML or Markdown (rendered with react-markdown + rehype-raw). */
  content: string;
}

const handWrittenGuides: Guide[] = [
  {
    id: "paraguay-tax-residency",
    slug: "paraguay-tax-residency-remote-workers",
    title: "Paraguay Tax Residency for Remote Workers: What Nobody On The Internet Will Actually Tell You",
    excerpt: "Territorial taxation, real costs, and the actual step-by-step process of getting residency as a remote worker in Asunción.",
    date: "2024-03-12",
    readTime: "8 min read",
    relatedDestinations: ["asuncion", "encarnacion"],
    content: `
<p>Let me be straight with you before we go any further.</p>
<p>I'm not a $5,000-a-session offshore consultant. I don't have a podcast where I tell you to "go where you're treated best" while I film myself in a rented villa. I'm not trying to sell you a flag theory masterclass or get you on a discovery call.</p>
<p>I'm a remote worker living in Asunción, Paraguay, right now. I work in acquisition and run my contracts through Deel, which (as it turns out) makes the whole "proving your income is foreign-sourced" part of this process almost embarrassingly straightforward. I found out about Paraguay's tax system the same way most people do: down a rabbit hole at 1am, skeptical, mostly convinced it was too good to be true.</p>
<p>It's not too good to be true. But it is more nuanced than the polished guides make it sound.</p>
<p>So grab your tereré. Here’s the real version.</p>

<h2><strong>Why Remote Workers Are Choosing Paraguay Right Now</strong></h2>
<h3><strong>Territorial Taxation: Explained Like a Human Being</strong></h3>
<p>Every country taxes you in one of two ways. Either they tax you on everything you earn, anywhere in the world (which is how the US, UK, Germany, and most of the places you’re probably fleeing work) or they only tax you on income earned within their borders. That second model is called territorial taxation, and Paraguay runs on it.</p>
<p>What that means in practice, if you’re a remote worker: the money your US client pays you, the retainer from your European company, the Deel contract you invoice every month, Paraguay doesn’t touch any of it. Zero income tax on foreign-sourced revenue. Not a low rate. Zero.</p>
<p>The flat rates that do apply (10% personal income tax, 10% corporate, 10% VAT) only kick in if you’re earning money from within Paraguay itself. Local clients, local business activity. That’s not what most nomads are doing here, and it’s almost certainly not what you’re doing if you’re reading this.</p>
<p><em>You could live here full-time, hold Paraguayan residency, and pay no income tax on your remote work income, all completely legally. That’s not a loophole. That’s just how the system is designed.</em></p>

<h3><strong>The Numbers That Actually Attracted Me Here</strong></h3>
<p>I’d already looked at the usual suspects. Portugal’s NHR scheme got popular fast and the fine print got complicated fast. Georgia is genuinely great but the banking situation has tightened up for some nationalities. Panama keeps coming up, but the investment thresholds people quote (we’re talking $100,000 or more depending on the route) put it in a different category entirely.</p>
<p>Paraguay? The total realistic cost to get residency, including a local gestóría to shepherd your paperwork, government fees, and the weeks you’ll spend here while it processes, lands somewhere between $900 and $2,000 USD. We’ll break that down in detail later.</p>
<p>The tax rates here are also just... clean. There’s a reason people call it the 10-10-10 country (10% across the board on everything taxable. No hidden surtax, no complicated bracket math, no surprise social contributions eating into your number. For the kind of income structure I have) foreign contracts, paid through Deel, clearly documented, it’s almost a perfect fit.</p>
<p>And here’s the thing nobody writes about because they’re not actually here: Asunción is genuinely liveable. It’s not Medellín with its Instagram infrastructure or Buenos Aires with its chaotic beautiful energy. It’s quieter, slower, and cheaper than both, in a way that, once you adjust, starts to feel like a feature rather than a bug.</p>

<h2><strong>Are You Actually Eligible? Who This Works For</strong></h2>
<h3><strong>Remote Workers vs. Freelancers vs. Business Owners: The Real Distinction</strong></h3>
<p>People overcomplicate this. Let me simplify it.</p>
<p>If your income comes from clients, employers, or contracts outside of Paraguay (meaning you’re doing work for people and companies that have nothing to do with this country) you’re in the sweet spot. Whether you’re a freelancer invoicing a US agency, a full-time remote employee on a foreign payroll, or someone running acquisition for an international company from a café in Villa Morra, the structure is essentially the same: the income is foreign-sourced, Paraguay doesn’t tax it, you’re good.</p>
<p>The platform you use to manage that actually matters more than most people realize. I run my contracts through Deel, and I cannot overstate how much easier that makes the documentation side of things. Deel generates clean, timestamped, internationally-recognized payment records that clearly show where the income is coming from and who’s paying it. When you eventually need to demonstrate to a gestóría (or anyone else) that your income is foreign-sourced, you hand them a Deel statement and the conversation is basically over.</p>
<p><em>No grey area, no scrambling for bank records from four different sources, no explaining what a wire transfer from a US LLC means. It’s a golden ticket for this specific process.</em></p>
<p>Business owners operating through a foreign entity are also well-positioned, though the structure gets slightly more nuanced depending on how you pay yourself. Worth a conversation with a local accountant, which we’ll get to.</p>

<h3><strong>Income Sources That Qualify: And the Grey Areas to Know</strong></h3>
<ul>
<li><strong>✅  </strong>Foreign clients paying you remotely, Clean. This is the core case.</li>
<li><strong>✅  </strong>International payroll platforms (Deel, Remote, etc.), Ideal. Documentation is airtight.</li>
<li><strong>✅  </strong>Foreign company dividends or owner’s draws, Generally yes, but get it structured clearly.</li>
<li><strong>⚠️  </strong>Crypto income, It depends, and the rules are still catching up. Talk to a local tax attorney before you assume.</li>
<li><strong>❌  </strong>Income from Paraguayan clients or local business activity, Taxable. Full stop.</li>
</ul>

<h3><strong>What You Do NOT Need: Debunking the Myths</strong></h3>
<p>This might be the most useful thing in this article, because the misinformation floating around is genuinely discouraging people who would otherwise be perfect candidates.</p>
<ul>
<li>You do not need to invest a large sum of money. That’s Panama’s residency-by-investment route, which runs $100,000+.</li>
<li>You do not need to already speak fluent Spanish. You’ll need some (enough to navigate daily life) but the actual paperwork process happens through your gestóría.</li>
<li>You do not need to commit to living here forever. There are minimum presence requirements to maintain residency over time, but the initial process has no permanent residency obligation.</li>
</ul>

<h2><strong>The Step-by-Step Residency Process</strong></h2>
<h3><strong>Step 1: Get Your Documents Apostilled Before You Land</strong></h3>
<p>Do this before you book your flight. Seriously. This is the step people skip and then spend weeks waiting for back home while they’re already here burning through accommodation money.</p>
<p>You’ll need, at minimum: a birth certificate and a criminal background check from your home country. Both need to be apostilled, a standardized international certification that makes your documents legally recognized in Paraguay. In the US, it’s done at the Secretary of State level. In the UK, through the Foreign, Commonwealth and Development Office.</p>
<p>The timeline varies. Some countries process apostilles in a week. Others take four to six weeks. Check your country now, before you make any other plans, because this is almost always the longest single step in the entire process.</p>

<h3><strong>Step 2: Find a Local Gestóría. This Is Not Optional.</strong></h3>
<p>I want to be completely direct here: do not attempt to navigate the Paraguayan immigration bureaucracy alone with basic Spanish and a PDF guide you found online. I say this with love. I’ve seen people try. It doesn’t go well.</p>
<p>A gestóría is essentially a local fixer, an individual or small firm that knows the Migraciones system, has working relationships with the relevant offices, knows which forms changed last month, and knows how to move things along when they stall.</p>
<p><em>Most gestórías that work with expats and nomads are concentrated in the Centro and Villa Morra areas of Asunción. Find them through nomad community referrals, reputation matters enormously in a small market.</em></p>
<p>A decent gestóría will typically cost between $300 and $700 USD for the full residency service. That is not a lot of money for the headaches it saves you. Budget for it, use it, don’t second-guess it.</p>

<h3><strong>Step 3: The Cédula Application (Your Paraguayan ID)</strong></h3>
<p>The Cédula is your Paraguayan identification card, and getting it is a rite of passage that every single person who’s done this process has a story about.</p>
<p>The Departamento de Identificaciones is located in central Asunción, and I’ll describe it to you accurately: it is chaotic. Genuinely, productively, authentically chaotic in the way that a lot of South American government offices are. You will wait. You will wait in a crowded room with people who also appear to be waiting, and you will not always be entirely sure what you’re waiting for.</p>
<p>Here’s the thing though, it’s not a broken system. It just moves differently to what you’re used to. Things happen. Documents get processed. Stamps get applied. Your Cédula gets issued. Accept that, bring a book, have your gestóría’s number in your phone, and let it be what it is.</p>

<h3><strong>Step 4: RUC Registration: Do You Actually Need It?</strong></h3>
<p>The RUC is Paraguay’s tax identification number. If you’re a remote employee on a foreign payroll with no plans to invoice Paraguayan clients or form a local entity, you likely don’t need a RUC in the early stages. Ask your gestóría to advise based on your specific income structure, it’s a twenty-minute conversation that will save you from setting up things you don’t need.</p>

<h3><strong>Step 5: Opening a Bank Account. This Is the Hard Part.</strong></h3>
<p>Everything above? Manageable. Documented. A series of steps that, if you follow them, produce results.</p>
<p>Banking is where the friction lives.</p>
<p>Opening a local Paraguayan bank account as a foreigner without local income is genuinely the hardest single part of this entire process. Paraguayan banks are conservative, compliance requirements are strict, and without a payslip from a local employer, many branches will simply decline the application, politely, with a shrug, and without a great deal of explanation.</p>
<p>The banks most commonly cited as being relatively foreigner-friendly are Banco Continental and Bancop, but “friendlier” is relative. Your gestóría will likely have a relationship with a specific branch, use it.</p>
<p>In the meantime, the practical workaround most nomads use: Billeteras digitales like Tigo Money or Ueno let you transact locally without a full bank account. It’s not a permanent solution, but it gets you functional while the formal process catches up.</p>

<h2><strong>Real Costs: What Paraguay Residency Actually Costs in 2025</strong></h2>
<p>Let me tell you what I wish someone had told me before I started budgeting for this.</p>
<p>Every article you’ll find on Paraguay residency costs either gives you a suspiciously round number with no breakdown, or buries the real figure inside a consulting pitch. So here’s the actual itemized version, based on what people doing this right now (including me) are spending.</p>

<table class="w-full text-left border-collapse my-6">
  <thead>
    <tr>
      <th class="border-b border-border p-2">Item</th>
      <th class="border-b border-border p-2">Low End (USD)</th>
      <th class="border-b border-border p-2">High End (USD)</th>
      <th class="border-b border-border p-2">Notes</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="border-b border-border p-2">Document apostille (home country)</td>
      <td class="border-b border-border p-2">$50</td>
      <td class="border-b border-border p-2">$300</td>
      <td class="border-b border-border p-2">Varies by country. US states vary. UK is mid-range.</td>
    </tr>
    <tr>
      <td class="border-b border-border p-2">Gestoría / immigration lawyer</td>
      <td class="border-b border-border p-2">$300</td>
      <td class="border-b border-border p-2">$700</td>
      <td class="border-b border-border p-2">Non-negotiable. Pay it.</td>
    </tr>
    <tr>
      <td class="border-b border-border p-2">Government & processing fees</td>
      <td class="border-b border-border p-2">$100</td>
      <td class="border-b border-border p-2">$200</td>
      <td class="border-b border-border p-2">Official fees are low, Paraguay isn’t extracting money here</td>
    </tr>
    <tr>
      <td class="border-b border-border p-2">Translation services</td>
      <td class="border-b border-border p-2">$30</td>
      <td class="border-b border-border p-2">$100</td>
      <td class="border-b border-border p-2">Your gestoría may include this</td>
    </tr>
    <tr>
      <td class="border-b border-border p-2">Accommodation during process</td>
      <td class="border-b border-border p-2">$400</td>
      <td class="border-b border-border p-2">$900/mo</td>
      <td class="border-b border-border p-2">Villa Morra furnished apt vs. city centre Airbnb</td>
    </tr>
    <tr>
      <td class="border-b border-border p-2">Local transport & day-to-day</td>
      <td class="border-b border-border p-2">$50</td>
      <td class="border-b border-border p-2">$150</td>
      <td class="border-b border-border p-2">Ubers are cheap here</td>
    </tr>
    <tr>
      <td class="border-b border-border p-2">Misc. (photos, copies, surprises)</td>
      <td class="border-b border-border p-2">$30</td>
      <td class="border-b border-border p-2">$80</td>
      <td class="border-b border-border p-2">Always have a buffer for the random Tuesday at Migraciones</td>
    </tr>
    <tr>
      <td class="border-b border-border p-2"><strong>REALISTIC TOTAL</strong></td>
      <td class="border-b border-border p-2"><strong>$960</strong></td>
      <td class="border-b border-border p-2"><strong>$2,430</strong></td>
      <td class="border-b border-border p-2">Depending on your country and accommodation choices</td>
    </tr>
  </tbody>
</table>

<p>The accommodation number assumes you’re staying in Asunción during the process. If you’re in a furnished apartment in Villa Morra (where most nomads land) you’re looking at $400 to $600 a month for something comfortable. Short-term Airbnb near the Centro, budget higher.</p>
<p>The government fees being low is not a typo. Paraguay is genuinely not trying to charge you a premium for the privilege of becoming a resident. The cost of this process is almost entirely made up of the services around it, not the state fees themselves.</p>

<h3><strong>How Long Does It Actually Take? Real Timelines</strong></h3>
<p>Official estimate: 60 to 90 days once everything is submitted.</p>
<p>Actual experience: plan for five to seven months from the moment you start gathering documents at home to the moment you have your Cédula in hand.</p>
<p>The gap exists for a few reasons. Apostilles take longer than expected. Migraciones has backlogs that vary by season. Nothing about this process is broken, it’s just not optimized for speed, and fighting that is a losing battle.</p>

<h2><strong>Life in Asunción While You Wait: Is It Worth Staying?</strong></h2>
<p>Short answer: yes, if you adjust your expectations correctly.</p>
<h3><strong>Where to Stay: A Neighbourhood Reality Check</strong></h3>
<p><strong>Villa Morra</strong> is where you’ll probably end up, and for good reason. Safe, walkable by Asunción standards, solid restaurant and café options, and the furnished apartment market here is mature enough that you can find something decent without fluent Spanish. Most gestórías that work with foreigners have offices here or nearby.</p>
<p><strong>Carmelitas</strong> sits just south of Villa Morra and feels slightly more residential. Rents can be a touch lower. Less foot traffic, but still well-located for getting around.</p>
<p><strong>The Centro</strong> is where most government offices are, Migraciones, Identificaciones, the tax authority. You won’t want to live there, but you’ll visit regularly. Get comfortable navigating it early.</p>

<h3><strong>The Nomad Infrastructure: Honest Assessment</strong></h3>
<p>Internet: generally reliable in Villa Morra. Fibre optic connections are available in most modern apartment buildings. Co-working spaces are catching up (not Medellín-level yet, but functional and growing. The community of people doing exactly what you’re doing is bigger than the internet suggests) it just lives in WhatsApp groups and local Facebook communities more than on nomadlist.com.</p>

<h3><strong>The Honest Downsides: Because You Deserve Them</strong></h3>
<ul>
<li>The bureaucratic pace is slow. Not broken, not hostile, just slow in a way that will test you if you’re used to things happening on a timeline. Build this into your emotional budget, not just your financial one.</li>
<li>Spanish matters more than people admit. Your gestóría handles the formal process, but daily life requires at least functional Spanish. Use the residency waiting period to fix that.</li>
<li>Banking friction is real and ongoing. Getting fully banked as a foreigner without local income is a multi-month project, not a one-week errand.</li>
<li>It’s quieter than you might expect. If you’re coming from Buenos Aires or Medellín, Asunción will feel noticeably slower. The city isn’t trying to impress anyone, it just is what it is.</li>
</ul>

<h2><strong>Is Paraguay Tax Residency Right For You? An Honest Decision Framework</strong></h2>
<p>I’m going to do something most guides won’t: tell some of you to look elsewhere.</p>

<h3><strong>The “Yes: Start Gathering Your Documents This Week” Profile</strong></h3>
<ul>
<li>Your income is clearly foreign-sourced and documented. You’re on Deel, Remote, or Papaya, or you invoice international clients through a clean paper trail.</li>
<li>You’re already nomadic or location-flexible. The process requires you to be here for stretches. If you can work from anywhere, Paraguay is just another base.</li>
<li>You’re motivated by long-term tax efficiency, not a quick fix. This is a multi-month process, not a six-week transaction.</li>
<li>You’re genuinely curious about Paraguay and LatAm. The people who thrive here arrive with openness to what the city actually is, not just what it costs.</li>
<li>Your Spanish is functional, or you’re willing to make it functional fast.</li>
</ul>

<h3><strong>The “Maybe: Consider These Alternatives First” Profile</strong></h3>
<ul>
<li>Your tax situation is complicated. If you’re a US citizen, talk to a US expat tax attorney before doing anything else. US citizens are taxed on worldwide income regardless of where they live.</li>
<li>You want a faster process with less friction. Georgia’s Individual Entrepreneur status can be set up in weeks, not months.</li>
<li>You’re only nomadic part-time. If you spend most of the year in your home country, you may already be a tax resident there regardless of what Paraguay says.</li>
<li>You have a serious aversion to slow bureaucracy. There’s no version of this where I tell you it’s fast and frictionless.</li>
</ul>

<h3><strong>The “Not Right For You” Profile</strong></h3>
<ul>
<li>You’re planning to stay less than a few months a year and want to claim residency without any real presence.</li>
<li>You’re hoping this solves a tax problem without getting proper legal advice first. Spend $300 on a consultation with a qualified expat tax professional before you spend anything else.</li>
</ul>

<h2><strong>FAQ: The Questions Everyone Actually Searches For</strong></h2>
<h3><strong>Does Paraguay tax foreign income?</strong></h3>
<p>No. Paraguay operates on a territorial tax system, which means only income earned from activity within Paraguay is subject to local tax. If your clients, employer, or contracts are based outside Paraguay, that income is not taxed by the Paraguayan government.</p>

<h3><strong>How long can I stay in Paraguay without residency?</strong></h3>
<p>As a tourist, most nationalities get 90 days. Some can extend for another 90. Beyond that, you need a legal residency status. Your gestóría can advise on the timing relative to your tourist allowance.</p>

<h3><strong>Can I get Paraguay residency as a freelancer?</strong></h3>
<p>Yes (and it’s one of the cleaner scenarios. The key is being able to document that your clients are foreign. Contracts, invoices, platform statements (Deel, Upwork, whatever you use)) anything that shows money coming from outside Paraguay.</p>

<h3><strong>Is Paraguay residency the same as citizenship?</strong></h3>
<p>No. Residency and citizenship are separate processes with different timelines. You can apply for permanent residency after three years of temporary residency. Citizenship eligibility comes after a longer period of permanent residency. Most nomads are doing this for the residency and tax benefits, citizenship is years down the road.</p>

<h3><strong>Do I need to be in Paraguay to maintain my residency?</strong></h3>
<p>There are minimum presence requirements to maintain your residency status over time. The specifics depend on your residency category, get current guidance from your gestóría and verify with a local attorney. Don’t assume you can get residency and then disappear to Bali for two years without consequence.</p>

<h3><strong>Is Paraguay a tax haven?</strong></h3>
<p>Technically, no, and the distinction matters. A tax haven implies zero taxes, secrecy laws, and offshore financial sheltering. Paraguay is a normal sovereign country that happens to use a territorial model. It taxes plenty of things. It just doesn’t tax foreign-sourced income. Framing it as a tax haven can create the wrong expectations, and occasionally the wrong impression with your home country’s tax authority.</p>

<h2><strong>Your Action List: What to Do Before You Even Book a Flight</strong></h2>
<ul>
<li>✅ <strong>Talk to an expat tax professional in your home country first.</strong> One hour, a few hundred dollars, invaluable clarity. Do this before anything else.</li>
<li>✅ <strong>Check your apostille timeline.</strong> Look up how long your country takes and start the process immediately. This is your longest lead time item.</li>
<li>✅ <strong>Get your income documentation organized.</strong> Deel statements, contracts, invoices, pull them together and make sure they’re clean and exportable.</li>
<li>✅ <strong>Start building your Spanish.</strong> Duolingo won’t cut it. Find a tutor, use italki, commit to something structured.</li>
<li>✅ <strong>Connect with people already in Asunción.</strong> Join the digitalnomadspin.com community, it exists precisely for this kind of peer-to-peer local intelligence.</li>
</ul>
<p><em>This guide was written on the ground in Asunción, Paraguay, not from a co-working space in Lisbon or a consulting office in Dubai. If something here is outdated or you’ve had a different experience, say so in the comments. This is a living document.</em></p>
`
  },
  {
    id: "best-places-digital-nomads-2025",
    slug: "best-places-digital-nomads-2025",
    title: "Best Places for Digital Nomads in 2026",
    excerpt: "A 2026 shortlist of ten digital nomad bases, using Nomad Spin’s cost, internet, safety, community, and visa data across 780+ cities.",
    date: "2025-01-06",
    updated: "2026-10-07",
    readTime: "12 min read",
    relatedDestinations: ["chiang-mai", "lisbon", "medellin", "bali", "mexico-city", "buenos-aires", "tbilisi", "cape-town", "budapest", "hanoi"],
    content: `
<p>Every January, the same question shows up in nomad groups, Slack channels, and airport cafés: <em>Where should I go this year?</em></p>

<p>It’s a harder question in 2026 than a listicle can answer. A place can be cheap and beautiful and still have internet that dies every afternoon. It can have great Wi-Fi and a real community and still cost more than your home city. Visa rules keep moving: a border-run habit from 2023 may now be a formal visa, a savings balance, or both.</p>

<p>This is the 2026 edition of Nomad Spin’s shortlist. It reads ten bases against the same fields we store for <a href="/">780+ cities</a>: monthly cost, internet, safety, community, visa access, and climate. The numbers below are the ones on each city page. The order is a conversation order (where I would send someone first). Your own order is the one you get when you set floors and <a href="/">spin the globe</a>.</p>

<p>Cost figures are Nomad Spin’s solo monthly baseline: rent, food, local transport, and ordinary coworking. A specific apartment can land above or below that number. Visa days are the typical window in the dataset for many passports. Your passport can be a different window. Confirm the rule with an official source before you book a one-way.</p>

<h2><strong>The Criteria: What Actually Decides a Base</strong></h2>

<p>Six things do most of the work when a remote month succeeds or fails:</p>

<ul>
<li><strong>Budget:</strong> The heaviest filter. If the solo baseline is already over your ceiling, the café scene will not save the month.</li>
<li><strong>Internet:</strong> Average speed, reliability, and whether coworking is dense enough to be a backup.</li>
<li><strong>Safety:</strong> The headline score, plus female safety and LGBTQ+ friendliness on the city page. Read all three. They measure different things.</li>
<li><strong>Community:</strong> How quickly you can find other remote workers, and how far English carries you.</li>
<li><strong>Visa access:</strong> How long you can actually stay, and whether a longer season needs a real application.</li>
<li><strong>Vibe:</strong> Weather, food, and whether the city is livable on a random Tuesday. Use this last. The <a href="/guides/where-to-go-next-by-season">season guide</a> is the right place to veto a month.</li>
</ul>

<p>No sponsorships. Nothing in the order below was placed because a program paid for the slot.</p>

<h2><strong>The Ten, in the Dataset</strong></h2>

<p>Same fields, side by side. Open a city for the full page.</p>

<div class="overflow-x-auto">
<table class="w-full text-left border-collapse my-6">
  <thead>
    <tr>
      <th class="border-b border-border p-2">City</th>
      <th class="border-b border-border p-2">Solo month</th>
      <th class="border-b border-border p-2">Internet</th>
      <th class="border-b border-border p-2">Safety</th>
      <th class="border-b border-border p-2">Visa window in the dataset</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="border-b border-border p-2"><a href="/destinations/chiang-mai">Chiang Mai</a></td>
      <td class="border-b border-border p-2">$850</td>
      <td class="border-b border-border p-2">95 Mbps</td>
      <td class="border-b border-border p-2">8.2</td>
      <td class="border-b border-border p-2">30-day tourism exemption</td>
    </tr>
    <tr>
      <td class="border-b border-border p-2"><a href="/destinations/lisbon">Lisbon</a></td>
      <td class="border-b border-border p-2">$2,200</td>
      <td class="border-b border-border p-2">200 Mbps</td>
      <td class="border-b border-border p-2">8.8</td>
      <td class="border-b border-border p-2">DN visa field, 365 days (longer permit possible)</td>
    </tr>
    <tr>
      <td class="border-b border-border p-2"><a href="/destinations/medellin">Medellín</a></td>
      <td class="border-b border-border p-2">$1,100</td>
      <td class="border-b border-border p-2">80 Mbps</td>
      <td class="border-b border-border p-2">6.5</td>
      <td class="border-b border-border p-2">90-day exemption</td>
    </tr>
    <tr>
      <td class="border-b border-border p-2"><a href="/destinations/bali">Bali</a></td>
      <td class="border-b border-border p-2">$1,200</td>
      <td class="border-b border-border p-2">50 Mbps</td>
      <td class="border-b border-border p-2">7.8</td>
      <td class="border-b border-border p-2">30-day visa on arrival</td>
    </tr>
    <tr>
      <td class="border-b border-border p-2"><a href="/destinations/mexico-city">Mexico City</a></td>
      <td class="border-b border-border p-2">$1,300</td>
      <td class="border-b border-border p-2">90 Mbps</td>
      <td class="border-b border-border p-2">6.0</td>
      <td class="border-b border-border p-2">180-day exemption</td>
    </tr>
    <tr>
      <td class="border-b border-border p-2"><a href="/destinations/buenos-aires">Buenos Aires</a></td>
      <td class="border-b border-border p-2">$900</td>
      <td class="border-b border-border p-2">70 Mbps</td>
      <td class="border-b border-border p-2">6.2</td>
      <td class="border-b border-border p-2">90-day exemption</td>
    </tr>
    <tr>
      <td class="border-b border-border p-2"><a href="/destinations/tbilisi">Tbilisi</a></td>
      <td class="border-b border-border p-2">$800</td>
      <td class="border-b border-border p-2">60 Mbps</td>
      <td class="border-b border-border p-2">8.0</td>
      <td class="border-b border-border p-2">365 days visa-free</td>
    </tr>
    <tr>
      <td class="border-b border-border p-2"><a href="/destinations/cape-town">Cape Town</a></td>
      <td class="border-b border-border p-2">$1,400</td>
      <td class="border-b border-border p-2">100 Mbps</td>
      <td class="border-b border-border p-2">5.5</td>
      <td class="border-b border-border p-2">90-day exemption</td>
    </tr>
    <tr>
      <td class="border-b border-border p-2"><a href="/destinations/budapest">Budapest</a></td>
      <td class="border-b border-border p-2">$1,500</td>
      <td class="border-b border-border p-2">200 Mbps</td>
      <td class="border-b border-border p-2">8.3</td>
      <td class="border-b border-border p-2">Digital nomad visa, up to a year</td>
    </tr>
    <tr>
      <td class="border-b border-border p-2"><a href="/destinations/hanoi">Hanoi</a></td>
      <td class="border-b border-border p-2">$1,050</td>
      <td class="border-b border-border p-2">110 Mbps</td>
      <td class="border-b border-border p-2">8.0</td>
      <td class="border-b border-border p-2">90-day tourist visa</td>
    </tr>
  </tbody>
</table>
</div>

<h2><strong>1. Chiang Mai, Thailand: Still the Starter City</strong></h2>

<p><a href="/destinations/chiang-mai">Chiang Mai</a> is still the cleanest place to test the lifestyle on a modest budget. The solo baseline is about $850 a month, internet averages about 95 Mbps, and the community score is a 9. Nimman and Santitham are where remote workers actually sit.</p>

<p><strong>Why it wins:</strong> You can find a desk, a meetup, and someone who speaks your language in the first week. Safety sits at 8.2, which is high for a city this social and this cheap.</p>

<p><strong>Watch out for:</strong> Burning season is March and April, and it is genuinely unpleasant. February is still in the friendly dry window. The tourism visa exemption is 30 days for many passports, 15 days for two, and visa on arrival for three. It depends on your passport, and it is tourism only. A season measured in months usually means Thailand’s Destination Thailand Visa (DTV) or another long-stay category. Plan the visa that covers the trip. A border run is a fragile backup.</p>

<p><strong>Best for:</strong> First-time nomads, budget-conscious travelers, people who want company immediately.</p>

<p>Neighborhood trade-offs, coworking, and how March and April actually feel are in the <a href="/guides/living-in-chiang-mai">Chiang Mai living guide</a>.</p>

<h2><strong>2. Lisbon, Portugal: Europe’s Nomad Capital</strong></h2>

<p><a href="/destinations/lisbon">Lisbon</a> is the default European base for a reason: warm, walkable, English-friendly, and connected to the rest of the continent. In the dataset it is also the expensive one.</p>

<p><strong>Why it wins:</strong> About 200 Mbps, safety 8.8, community 9. Portugal’s remote-work route is a temporary-stay visa (under a year) or a D8 residency visa of 4 months that leads to a 2-year residence permit, renewable for 3-year periods. It is an application, not a visa-free year. Income and fees change; verify on official pages.</p>

<p><strong>Watch out for:</strong> The solo baseline is about $2,200 a month, the highest figure on this list, and central rent is why. The broad NHR tax incentive that used to sweeten the move has closed to new applicants. The regime that replaced it targets specific professional profiles, which leaves most remote jobs outside it. Treat the D8 as an immigration path with queues and paperwork, and budget for the city you will actually live in.</p>

<p><strong>Best for:</strong> People who want EU infrastructure and will pay for it.</p>

<p>Neighborhood trade-offs, the monthly cost bands, and how a Schengen visit differs from the D8 are in the <a href="/guides/living-in-lisbon">Lisbon living guide</a>.</p>

<h2><strong>3. Medellín, Colombia: Value, With a Neighborhood Plan</strong></h2>

<p><a href="/destinations/medellin">Medellín</a> stays on the list for the weather and the café map. The solo baseline is about $1,100 a month, against about $2,200 in Lisbon, so the budget gap is real. Internet averages about 80 Mbps. El Poblado and Laureles are where most remote workers base themselves. Many passports get about 90 days visa-free.</p>

<p><strong>Why it wins:</strong> Spring temperatures through the year, a community score of 8, and a cost that leaves room for a coworking membership.</p>

<p><strong>Watch out for:</strong> Safety is 6.5, and it is neighborhood-specific. Tourist-targeted robbery, including dating-app setups, is a known pattern, so pick the area before you pick the apartment. Female safety in the dataset is a 5. Spanish changes the month more than the Instagram version suggests.</p>

<p><strong>Best for:</strong> North American time zones, Spanish learners, people who will choose a neighborhood on purpose.</p>

<p>Laureles versus El Poblado, the 90-day exemption field, and how the safety scores actually feel are in the <a href="/guides/living-in-medellin">Medellin living guide</a>.</p>

<h2><strong>4. Bali, Indonesia: The Social Island, With a Visa Plan</strong></h2>

<p><a href="/destinations/bali">Bali</a> is popular because the community score is a 9 and the café map is ridiculous. The same dataset explains the complaints: average internet is about 50 Mbps, and the solo baseline of about $1,200 is a floor that Canggu villas and brunch leave behind quickly.</p>

<p><strong>Why it wins:</strong> Surf, coworking density, and a social life that can start on day two. Outside the most touristy pockets the baseline is easier to hit. Ubud and parts of the Bukit are different products from Canggu traffic.</p>

<p><strong>Watch out for:</strong> Visa on arrival in the dataset is 30 days. The long-stay visit visa that older posts still call the B211A is now the C1 (typically 60 days, extendable toward half a year). People employed by a company outside Indonesia who want a full year look at the E33G remote worker visa, which asks for an income bar and a foreign contract. LGBTQ+ friendliness in the dataset is low (4). Read <a href="/guides/living-in-bali">living in Bali</a> before a villa deposit.</p>

<p><strong>Best for:</strong> People who want the beach social scene and will budget a backup connection.</p>

<h2><strong>5. Mexico City, Mexico: Big-City Energy on US Hours</strong></h2>

<p><a href="/destinations/mexico-city">Mexico City</a> is the big-city option on a clock that overlaps the United States. The solo baseline is about $1,300 a month, internet about 90 Mbps, community 8. Roma, Condesa, and Polanco have the café density, and they usually cost more than that baseline. The food is the reason a lot of people stay.</p>

<p><strong>Why it wins:</strong> Culture, kitchens, and a workday that lines up with US calls. The dataset lists a 180-day visa exemption, which is the common maximum for many passports.</p>

<p><strong>Watch out for:</strong> Safety is 6.0, and female safety is a 5. Pollution, traffic, altitude, and noise are the city itself. The officer at the border decides the stamp you actually receive, so a six-month plan needs a fallback if the stamp is shorter.</p>

<p><strong>Best for:</strong> City people, food lovers, anyone who needs overlap with US hours.</p>

<p>Neighborhood choice, the 180-day exemption field, and how altitude and air quality actually feel are in the <a href="/guides/living-in-mexico-city">Mexico City living guide</a>.</p>

<h2><strong>6. Buenos Aires, Argentina: European Texture, Updated Prices</strong></h2>

<p><a href="/destinations/buenos-aires">Buenos Aires</a> still feels like a European capital on a Latin American baseline: about $900 a month in the dataset, with internet around 70 Mbps. Palermo and Recoleta are the practical bases. Many passports get about 90 days.</p>

<p><strong>Why it wins:</strong> Café culture, architecture, nightlife, steak. The community is smaller than Medellín’s (score 6) and the price is lower.</p>

<p><strong>Watch out for:</strong> The parallel-exchange discount that made 2022 and 2023 feel unreal has narrowed. Dollar prices are higher than those meme years. Inflation is calmer than the crisis headlines and still belongs in the budget, along with how you pay. Safety is 6.2, mostly as petty crime. Bureaucracy is slow.</p>

<p><strong>Best for:</strong> Night owls and culture people who want that atmosphere near a $900 baseline.</p>

<p>Neighborhood choice, the 90-day exemption field, and why the $900 figure moves with inflation are in the <a href="/guides/living-in-buenos-aires">Buenos Aires living guide</a>.</p>

<h2><strong>7. Tbilisi, Georgia: The Long-Stay Bargain</strong></h2>

<p><a href="/destinations/tbilisi">Tbilisi</a> is the clearest long-stay bargain on this list. The dataset lists visa-free entry up to 365 days for many passports, a solo baseline around $800, and safety 8.0.</p>

<p><strong>Why it wins:</strong> A full year without a nomad-visa application is rare. Wine, walking, and prices that make Western Europe look theatrical. A renovated flat in the center costs more than the baseline. An ordinary solo month often stays near it.</p>

<p><strong>Watch out for:</strong> Internet averages about 60 Mbps: fine for most calls, thinner for heavy uploads. Georgian is difficult, English thins out past the center, and winters are gray. Banking has tightened for some nationalities, so a local account can be a project. LGBTQ+ friendliness in the dataset is a 3, the low end of this shortlist. The community score is 6: real, and smaller than Chiang Mai.</p>

<p><strong>Best for:</strong> Long stays, visa simplicity, people who like a city that is getting on with its own life.</p>

<p>Neighborhood trade-offs, the 365-day visa-free field, and how winter and 60 Mbps internet actually feel are in the <a href="/guides/living-in-tbilisi">Tbilisi living guide</a>.</p>

<h2><strong>8. Cape Town, South Africa: Beauty, With a Safety Plan</strong></h2>

<p><a href="/destinations/cape-town">Cape Town</a> is mountains, ocean, and English in one city, at a solo baseline of about $1,400. Dataset internet is about 100 Mbps where the fiber is actually in the unit. Many passports get about 90 days visa-free.</p>

<p><strong>Why it wins:</strong> Nature you can reach inside a normal week. Coworking exists. Longer stays can use South Africa’s remote-work visitor visa, in place since late 2024, which asks for a foreign contract and an income threshold. The <a href="/guides/living-in-cape-town">Cape Town living guide</a> has the current checklist.</p>

<p><strong>Watch out for:</strong> Safety is 5.5, the lowest on this list, and female safety is a 4. Neighborhood choice is the decision. Load shedding has been rare for long stretches since 2024, and it has come back before. Keep a battery or a coworking backup. Power-grid stability in the dataset is still a weak score for that reason.</p>

<p><strong>Best for:</strong> Nature, English-speaking Africa, people who will take safety and power seriously.</p>

<h2><strong>9. Budapest, Hungary: Central Europe at a Lower Baseline</strong></h2>

<p><a href="/destinations/budapest">Budapest</a> is old-Europe texture with fast pipes. The solo baseline is about $1,500, against about $2,200 in <a href="/destinations/berlin">Berlin</a> and about $2,400 in <a href="/destinations/vienna">Vienna</a> in the same dataset. Internet is about 200 Mbps, tied with Lisbon on this list. Safety is 8.3.</p>

<p><strong>Why it wins:</strong> Transit, baths, architecture, and a bill that is still a European city rather than a Western European capital. The White Card is Hungary’s remote-worker visa for non-EU passports. Confirm the current income rule on an official source before you build a year around it. EU citizens have a simpler path.</p>

<p><strong>Watch out for:</strong> Winter is cold. Hungarian is difficult. The international scene is thinner than Lisbon’s. The political climate belongs in a long-stay decision. For a season of baths and trains, it rarely decides the trip by itself.</p>

<p><strong>Best for:</strong> People who want four real seasons and a European base under a Lisbon budget.</p>

<p>District trade-offs, the White Card against a Schengen short stay, and the $1,500 versus Lisbon internet comparison are in the <a href="/guides/living-in-budapest">Budapest living guide</a>.</p>

<h2><strong>10. Hanoi, Vietnam: Food, Density, and a Corrected Budget</strong></h2>

<p><a href="/destinations/hanoi">Hanoi</a> is the food city on this list. Nomad Spin’s solo baseline puts it at about $1,050 a month, above Tbilisi (about $800), Chiang Mai (about $850), and Buenos Aires (about $900). Older versions of this guide said you could live well on $700. That figure does not match the current dataset.</p>

<p><strong>Why it wins:</strong> Internet about 110 Mbps, safety 8, community 7. The Old Quarter and Tay Ho are the usual bases. The food is the point. Vietnam’s e-visa covers many passports for up to 90 days. Check the official portal for your nationality before you assume the application is a formality.</p>

<p><strong>Watch out for:</strong> Traffic is intense. Air quality moves around. The nomad scene is smaller than Chiang Mai or Bali. LGBTQ+ friendliness in the dataset is a 4. A quiet apartment plus coworking sits on top of the baseline, which is how people blow the old budget meme.</p>

<p><strong>Best for:</strong> Food-first travelers who want a dense Asian city and can handle the street.</p>

<p>If you want the beach version of Vietnam, Da Nang's row is about $700 a month, safety 8.5, and best months Feb-Jul. That $700 is not a Hanoi budget. Neighborhoods, the 90-day e-visa, and why Sep-Dec is a real disruption are in the <a href="/guides/living-in-da-nang">Da Nang living guide</a>.</p>

<p>If you want the city version of Vietnam, Ho Chi Minh City's row is about $800 a month, safety 7.5, coworking High, and best months Dec-Apr. That season lines up with Chiang Mai and Bangkok, not with Da Nang. District choice, traffic, air pollution, and the 90-day e-visa are in the <a href="/guides/living-in-ho-chi-minh-city">Ho Chi Minh City living guide</a>.</p>

<h2><strong>How to Choose the Right One for You</strong></h2>

<p>The useful city is the one that clears your floors. If you have not written those down, start with <a href="/guides/how-to-choose-next-nomad-base">how to choose your next base</a>, then come back here.</p>

<ul>
<li><strong>Lowest solo baseline:</strong> <a href="/destinations/tbilisi">Tbilisi</a> (about $800), <a href="/destinations/chiang-mai">Chiang Mai</a> (about $850), <a href="/destinations/buenos-aires">Buenos Aires</a> (about $900).</li>
<li><strong>Fastest internet on this list:</strong> <a href="/destinations/lisbon">Lisbon</a> and <a href="/destinations/budapest">Budapest</a> (about 200 Mbps). Hanoi (about 110) and Chiang Mai (about 95) are comfortable for calls. Bali (about 50) needs a second connection.</li>
<li><strong>Strongest community scores:</strong> Chiang Mai, Bali, and Lisbon.</li>
<li><strong>Longest straightforward stays in the dataset:</strong> Tbilisi (365 days visa-free for many passports). Lisbon and Budapest list a digital nomad visa field of 365 days, with income proof. For Lisbon that field is the initial visa; the residence permit can be longer. <a href="/destinations/tirana">Tirana</a> shows the same one-year visa-free pattern if you want a smaller European city that did not make this ten. Thailand’s tourism exemption is 30 days for many passports (not all) and is tourism only. A season there is a DTV conversation.</li>
<li><strong>Nature:</strong> Cape Town, Bali, and Medellín, after you check the <a href="/guides/where-to-go-next-by-season">season window</a>. Burning season, Cape Town winter, and Bali’s rains are all in the dataset.</li>
</ul>

<h2><strong>Spin the Globe and Find Your Match</strong></h2>

<p>These ten cities are a starting point. Your base depends on your budget, your calls, your passport, and the life you want on a Tuesday.</p>

<p>For the hubs that punish a casual booking, read <a href="/guides/living-in-bali">living in Bali</a>, <a href="/guides/living-in-bangkok">living in Bangkok</a>, <a href="/guides/living-in-barcelona">living in Barcelona</a>, <a href="/guides/living-in-budapest">living in Budapest</a>, <a href="/guides/living-in-buenos-aires">living in Buenos Aires</a>, <a href="/guides/living-in-cape-town">living in Cape Town</a>, <a href="/guides/living-in-chiang-mai">living in Chiang Mai</a>, <a href="/guides/living-in-da-nang">living in Da Nang</a>, <a href="/guides/living-in-ho-chi-minh-city">living in Ho Chi Minh City</a>, <a href="/guides/living-in-lisbon">living in Lisbon</a>, <a href="/guides/living-in-medellin">living in Medellin</a>, <a href="/guides/living-in-mexico-city">living in Mexico City</a>, <a href="/guides/living-in-porto">living in Porto</a>, <a href="/guides/living-in-prague">living in Prague</a>, <a href="/guides/living-in-tallinn">living in Tallinn</a>, <a href="/guides/living-in-tbilisi">living in Tbilisi</a>, and <a href="/guides/living-in-valencia">living in Valencia</a> before you pay a deposit. Then <a href="/">open Nomad Spin</a>, set your budget, internet, and safety minimums, and spin. The match should come from your constraints.</p>

<p><em>First published January 2025. Last updated: October 7, 2026. Costs and visa rules change quickly. Always double-check before booking.</em></p>
`
  }
];

/**
 * All static guides: hand-written HTML guides above plus editorial Markdown
 * guides compiled from content/guides by scripts/sync-content-guides.ts.
 * Most recently updated first (publication date when a guide has no `updated`).
 */
const guideSortKey = (guide: Guide) => (guide.updated ?? guide.date).slice(0, 10);

export const guides: Guide[] = [...contentGuides, ...handWrittenGuides].sort((a, b) =>
  guideSortKey(b).localeCompare(guideSortKey(a))
);

/** Guides that list the given destination slug as related. */
export function guidesForDestination(slug: string): Guide[] {
  return guides.filter((g) => g.relatedDestinations?.includes(slug));
}

/** Prefer this city's own living guide, then another living guide that names it. */
export function editorialGuideForDestination(slug: string): Guide | null {
  const related = guidesForDestination(slug);
  const ownLiving = related.find((guide) => guide.slug === `living-in-${slug}`);
  if (ownLiving) return ownLiving;
  return related.find((guide) => guide.slug.startsWith('living-in-')) ?? related[0] ?? null;
}
