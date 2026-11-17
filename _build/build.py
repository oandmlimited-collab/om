#!/usr/bin/env python3
"""Builds the OM Ltd static pages from shared partials.
Run from the website folder:   python _build/build.py .
"""
from pathlib import Path
import sys

HERE = Path(__file__).resolve().parent
OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else HERE.parent
VERSION = "3.0.0"
exec((HERE / "icons.py").read_text(encoding="utf-8"))   # defines I = {...}
ARROW = I["arrow"].replace("<svg ", '<svg class="arrow" ', 1)

SERVICES = ["Plumbing installation and repairs", "Irrigation and farm supplies", "Construction and renovation",
            "Workwear and safety equipment", "Branded merchandise", "Multiple services / Other enquiry"]
NAV = [("index.html#services", "Services", "home"), ("merch.html", "Shop", "merch"),
       ("founders.html", "Founders", "founders"), ("testimonials.html", "Reviews", "testimonials")]


def head(title, desc, page, robots=""):
    cur = lambda k: ' aria-current="page"' if k == page else ""
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">{robots}
<meta name="theme-color" content="#f5f7fb">
<meta property="og:type" content="website"><meta property="og:site_name" content="OM Ltd">
<meta property="og:title" content="{title}"><meta property="og:description" content="{desc}">
<meta property="og:image" content="assets/people/farmer.webp"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:site" content="@OMlimiteds">
<link rel="icon" type="image/png" href="assets/favicon.png"><link rel="apple-touch-icon" href="assets/icon-192.png"><link rel="manifest" href="manifest.webmanifest">
<script>try{{if(localStorage.getItem("om-theme")==="blue")document.documentElement.dataset.theme="blue"}}catch(e){{}}</script>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Sora:wght@600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="styles.css?v={VERSION}">
</head>
<body data-page="{page}">
<a class="skip-link" href="#main">Skip to content</a>
<div class="announcement"><span id="announcementText">Mon–Sat 8:00 am – 6:00 pm · Plumbing emergencies 24 hours</span><a href="https://wa.me/254714995749?text=Emergency%3A%20" target="_blank" rel="noopener">Emergency? WhatsApp us →</a></div>
<header class="site-header">
 <div class="container nav-wrap">
  <a class="brand" href="index.html" aria-label="OM Ltd home"><span class="brand-logo" aria-hidden="true"></span><span class="brand-copy"><strong>OM Ltd</strong><small>Quality Water Solutions</small></span></a>
  <nav class="main-nav" id="mainNav" aria-label="Main">
   {''.join(f'<a href="{h}"{cur(k)}>{t}</a>' for h, t, k in NAV)}
   <a href="#" data-chat-open>OM AI</a>
   <a class="btn btn-primary btn-sm" href="index.html#quote">Free quote</a>
  </nav>
  <div class="nav-tools">
   <button class="icon-btn theme-toggle" type="button" aria-label="Switch to blue theme" title="Switch theme">{I["sun"]}{I["moon"]}</button>
   <button class="icon-btn menu-toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mainNav"><span></span><span></span><span></span></button>
  </div>
 </div>
</header>
<main id="main">
'''


def footer():
    return f'''</main>
<footer class="site-footer">
 <div class="container footer-grid">
  <div class="footer-about">
   <a class="brand" href="index.html"><span class="brand-logo" aria-hidden="true"></span><span class="brand-copy"><strong>OM Ltd</strong><small>Quality Water Solutions</small></span></a>
   <p>Plumbing, construction and irrigation for homes, businesses and farms — one team, one contact, one written quote.</p>
   <p class="hours"><b>Mon–Sat</b> 8:00 am – 6:00 pm<br><b>Emergencies</b> 24 hours</p>
   <div class="socials">
    <a href="https://x.com/OMlimiteds" target="_blank" rel="noopener" aria-label="OM Ltd on X">{I["x-social"]}</a>
    <a href="https://instagram.com/om.limiteds" target="_blank" rel="noopener" aria-label="OM Ltd on Instagram">{I["instagram"]}</a>
    <a href="https://www.tiktok.com/@om.limited" target="_blank" rel="noopener" aria-label="OM Ltd on TikTok">{I["tiktok"]}</a>
    <a href="https://www.facebook.com/search/pages/?q=OM%20Limited" target="_blank" rel="noopener" aria-label="OM Ltd on Facebook">{I["facebook"]}</a>
   </div>
  </div>
  <div><h4>Solutions</h4><ul>
   <li><a href="index.html#services">Plumbing &amp; repairs</a></li><li><a href="index.html#services">Construction &amp; renovation</a></li>
   <li><a href="merch.html#farm">Irrigation &amp; farm</a></li><li><a href="merch.html#workwear">Workwear &amp; PPE</a></li><li><a href="merch.html">Branded merchandise</a></li>
  </ul></div>
  <div><h4>Company</h4><ul>
   <li><a href="founders.html">Founders</a></li><li><a href="testimonials.html">Reviews</a></li><li><a href="newsletter.html">Newsletter</a></li>
   <li><a href="#" data-chat-open>OM AI</a></li><li><a href="mailto:oandmlimited@gmail.com">oandmlimited@gmail.com</a></li><li><a href="https://wa.me/254714995749" target="_blank" rel="noopener">+254 714 995 749</a></li>
  </ul></div>
  <div class="newsletter"><h4>Newsletter</h4>
   <p>Farm-season tips, merch drops and offers. No spam.</p>
   <form class="news-form" id="newsForm" novalidate>
    <label class="sr-only" for="newsEmail">Email address</label>
    <input id="newsEmail" name="email" type="email" placeholder="you@example.com" autocomplete="email" required>
    <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
    <button class="btn btn-primary btn-sm" type="submit">Subscribe</button>
   </form>
   <p class="news-status" id="newsStatus" role="status" aria-live="polite"></p>
  </div>
 </div>
 <div class="container footer-bottom">
  <span>© <span data-year></span> OM Ltd · Build · Flow · Thrive</span>
  <nav aria-label="Footer"><a href="index.html#quote">Request a quote</a><a href="merch.html">Shop</a><a href="admin.html">Team login</a><span class="fb-status" id="fbStatus" title="Firebase connection"><i></i><span>Offline mode</span></span></nav>
 </div>
</footer>

<button class="icon-btn to-top" type="button" aria-label="Back to top">{I["up"]}</button>

<button class="chat-launcher" type="button" data-chat-open aria-label="Open OM AI chat"><span class="ai-dot">{I["omai"]}</span><span class="label">Ask OM AI</span></button>
<section class="chat-panel" id="chatPanel" role="dialog" aria-modal="false" aria-labelledby="chatTitle">
 <div class="chat-head">
  <span class="ai-dot" id="chatAvatar">{I["omai"]}</span>
  <div><b id="chatTitle">OM AI</b><small><i></i><span id="chatMode">AI assistant · replies instantly</span></small></div>
  <button class="icon-btn" id="chatReset" type="button" aria-label="Start a new chat" title="New chat">{I["refresh"]}</button>
  <button class="icon-btn" id="chatClose" type="button" aria-label="Close chat">{I["x"]}</button>
 </div>
 <div class="mode-switch" role="group" aria-label="Chat mode">
  <button type="button" data-mode="ai" aria-pressed="true">{I["spark"]} OM AI</button>
  <button type="button" data-mode="human" aria-pressed="false">{I["headset"]} Talk to a human</button>
 </div>
 <div class="chat-body" id="chatBody" aria-live="polite"></div>
 <div class="chat-suggest" id="chatSuggest"></div>
 <div class="human-fields" id="humanFields" hidden>
  <label class="sr-only" for="hName">Your name</label><input id="hName" autocomplete="name" placeholder="Your name *" maxlength="80">
  <label class="sr-only" for="hPhone">WhatsApp / phone</label><input id="hPhone" type="tel" autocomplete="tel" placeholder="WhatsApp / phone *" maxlength="40">
 </div>
 <form class="chat-input" id="chatForm">
  <label class="sr-only" for="chatText">Message</label>
  <textarea id="chatText" rows="1" placeholder="Ask OM AI anything…" maxlength="800"></textarea>
  <button class="chat-send" type="submit" aria-label="Send">{I["send"]}</button>
 </form>
 <p class="chat-foot" id="chatFoot">OM AI is an automated assistant. Prices &amp; stock are confirmed by the OM team.</p>
</section>

<div class="lightbox" id="lightbox" aria-hidden="true"><button class="icon-btn" type="button" aria-label="Close image">{I["x"]}</button><img alt=""></div>
<div class="toast-wrap" id="toasts" aria-live="polite"></div>
<script type="module" src="js/app.js?v={VERSION}"></script>
</body>
</html>
'''


def select_services():
    return '<select name="service" id="serviceSelect" required><option value="">Select a service</option>' + "".join(f"<option>{o}</option>" for o in SERVICES) + "</select>"


def interests_chips():
    return '''<div class="chips" style="margin:0">
      <label class="chip"><input type="checkbox" name="interests" value="farm" class="sr-only" checked>Farm &amp; irrigation</label>
      <label class="chip"><input type="checkbox" name="interests" value="plumbing" class="sr-only">Plumbing</label>
      <label class="chip"><input type="checkbox" name="interests" value="safety" class="sr-only">Safety &amp; workwear</label>
      <label class="chip"><input type="checkbox" name="interests" value="merch" class="sr-only" checked>Merch drops</label>
     </div>'''


def tile(img, kind, title, text, bullets=None, service=None, add=None, d=0):
    ul = f'<ul>{"".join(f"<li>{b}</li>" for b in bullets)}</ul>' if bullets else ""
    q = f'<a href="index.html#quote" class="text-link service-quote" data-service="{service}">Request a quote</a>' if service else ""
    a = f'<button class="add-btn" type="button" data-add="{add}" aria-label="Add {add} to enquiry list">{I["plus"]}</button>' if add else ""
    return f'''<article class="card card-hover tile reveal" style="--d:{d:.2f}s"><div class="tile-media"><img src="{img}" alt="{title}" loading="lazy"></div>
<div class="tile-body"><span class="tile-kind">{kind}</span><h3>{title}</h3><p>{text}</p>{ul}<div class="tile-foot">{q}{a}</div></div></article>'''


# ------------------------------------------------------------------ pages
def index():
    svc = [
        ("assets/products/flow-tap.webp", "Plumbing", "Plumbing installation &amp; repairs", "Installs and repairs for homes, businesses and new builds.", ["Leak detection &amp; repair", "Pipe installation, drainage &amp; sewer", "Bathroom &amp; kitchen fitting"], SERVICES[0]),
        ("assets/people/pair.webp", "Construction", "Construction &amp; renovation", "Builders and plumbers working as one team on your project.", ["Building construction", "Renovations &amp; finishing", "Water &amp; site works, estimates"], SERVICES[2]),
        ("assets/products/ir-sprinkler.webp", "Irrigation", "Irrigation &amp; farm supplies", "Water-smart systems for productive, efficient farms.", ["Drip &amp; sprinkler / lawn irrigation", "Solar pumps &amp; water supply", "Maintenance &amp; repair"], SERVICES[1]),
        ("assets/products/ir-pumps.webp", "Water supply", "Water tanks, pumps &amp; heaters", "Reliable water storage, pressure and hot water.", ["Water tanks &amp; pumps", "Water heaters &amp; solar", "Borehole &amp; booster pumps"], SERVICES[0]),
        ("assets/people/crew.webp", "Workplace", "Workwear &amp; safety", "Protective, branded kit that keeps your crew safe.", ["Coveralls, vests &amp; jackets", "Safety boots", "Hard hats, gloves &amp; glasses"], SERVICES[3]),
        ("assets/products/backpack-hero.webp", "Merchandise", "Branded merchandise", "Backpacks, notebooks and gear with the OM mark.", ["OM Smart Backpack", "OM Premium Notebook", "Custom logo items"], SERVICES[4]),
    ]
    cards = "".join(tile(*s_[:5], s_[5], d=i * .05) for i, s_ in enumerate(svc))

    posters = [("poster-irrigation", "Irrigation &amp; farm", "7 products"), ("poster-flow", "Pipes &amp; fittings", "Flow range"),
               ("poster-workwear", "Workwear &amp; safety", "6 products"), ("poster-backpack", "OM Smart Backpack", "6 colours"),
               ("poster-notebook", "OM Premium Notebook", "5 colours")]
    gallery = "".join(f'<figure class="card card-hover poster reveal" data-lightbox style="--d:{i*.05:.2f}s"><div class="frame"><img src="assets/{p}.webp" alt="{t} poster" loading="lazy"></div><figcaption>{t}<small>{s}</small></figcaption></figure>' for i, (p, t, s) in enumerate(posters))
    gallery += f'<a href="merch.html" class="card tile tile-cta reveal" style="--d:.25s"><div class="tile-body"><h3>Visit the OM shop</h3><p>Pick colours, build an enquiry list and get one combined quote.</p><span class="btn">Shop the collection{ARROW}</span></div></a>'

    return head("OM Ltd | Flowing Solutions for Every Project", "OM installs, repairs and builds for homes, businesses and farms — plumbing, construction and irrigation, plus workwear and branded merchandise. Open Mon–Sat, emergencies 24 hours.", "home") + f'''
<section class="hero">
 <div class="container hero-grid">
  <div>
   <span class="eyebrow">Plumbing · Construction · Irrigation</span>
   <h1>Flowing solutions for <span class="accent">every project.</span></h1>
   <p class="hero-lead">Plumbing, construction and irrigation — plus workwear and branded gear. One team, one point of contact and one written quote for homes, businesses and farms.</p>
   <div class="hero-actions">
    <a class="btn btn-primary" href="#quote" data-track="hero_quote">Get a free quote{ARROW}</a>
    <a class="btn btn-outline" href="merch.html">Browse the shop</a>
   </div>
   <div class="chips" role="group" aria-label="Quick service picker">
    <a class="chip service-quote" href="#quote" data-service="{SERVICES[0]}">Plumbing</a>
    <a class="chip service-quote" href="#quote" data-service="{SERVICES[1]}">Irrigation</a>
    <a class="chip service-quote" href="#quote" data-service="{SERVICES[2]}">Construction</a>
    <a class="chip service-quote" href="#quote" data-service="{SERVICES[3]}">Workwear</a>
   </div>
  </div>
  <div class="hero-media reveal">
   <div class="hero-photo"><img src="assets/people/farmer.webp" alt="A smiling farmer giving a thumbs up in a field irrigated with OM sprinklers" width="902" height="860"></div>
   <span class="hero-badge">🌱 Grow more. Worry less.</span>
   <button class="hero-note" type="button" data-chat-open data-chat-ask="I want to irrigate a 1 acre farm. What do you recommend?"><span class="ai-dot">{I["omai"]}</span><span><b>Ask OM AI</b><small>“What irrigation fits my 1-acre farm?”</small></span></button>
  </div>
 </div>
</section>

<div class="section-alt"><div class="container trust" aria-label="Who we serve">
 <span>{I["home"]}Homes</span><span>{I["building"]}Businesses</span><span>{I["field"]}Farms</span><span>{I["clock"]}Mon–Sat 8am–6pm</span><span>{I["bolt"]}24-hour emergencies</span>
</div></div>

<section class="section" id="services">
 <div class="container">
  <div class="section-head reveal"><span class="eyebrow">What we do</span><h2>Everything you need, in one place.</h2><p>Pick a service to add it straight to your quotation request.</p></div>
  <div class="grid grid-3">{cards}</div>
 </div>
</section>

<section class="section section-alt" id="about">
 <div class="container split">
  <div class="split-photo reveal"><img src="assets/people/crew.webp" alt="The OM team in branded coveralls, hi-vis vests and hard hats on site" loading="lazy"></div>
  <div class="reveal" style="--d:.1s">
   <span class="eyebrow">Who we are</span>
   <h2>One team. One contact. One written quote.</h2>
   <p class="muted">OM installs, repairs and builds for homes, businesses and farms. Our plumbers, builders and irrigation specialists work as one team — so you get one point of contact, one schedule and one written quote.</p>
   <ul class="check-list"><li>Qualified team and quality materials</li><li>Clear, itemised pricing before work starts</li><li>Every job pressure- and flow-tested before handover</li></ul>
   <div class="hero-actions" style="margin-top:0"><a class="btn btn-primary" href="#quote">Get a free quote{ARROW}</a><a class="btn btn-outline" href="https://wa.me/254714995749" target="_blank" rel="noopener">WhatsApp photos</a></div>
  </div>
 </div>
</section>

<section class="section" id="collection">
 <div class="container">
  <div class="section-head reveal"><span class="eyebrow">The OM collection</span><h2>Products that carry the OM mark.</h2><p>Tap a poster to see it full size.</p></div>
  <div class="grid grid-3">{gallery}</div>
 </div>
</section>

<section class="section" id="process">
 <div class="container">
  <div class="section-head center reveal"><span class="eyebrow">How a job runs</span><h2>Five clear steps, no surprises.</h2></div>
  <div class="grid grid-5"><div class="card feature reveal" style="--d:0.00s"><span class="step-no">STEP 01</span><h3>Tell us what&#39;s happening</h3><p>Call, send a request or WhatsApp photos.</p></div><div class="card feature reveal" style="--d:0.06s"><span class="step-no">STEP 02</span><h3>We assess the site</h3><p>A technician inspects and measures.</p></div><div class="card feature reveal" style="--d:0.12s"><span class="step-no">STEP 03</span><h3>You get a written quote</h3><p>Clear, itemised pricing before work starts.</p></div><div class="card feature reveal" style="--d:0.18s"><span class="step-no">STEP 04</span><h3>We do the work</h3><p>Qualified team, quality materials, tidy site.</p></div><div class="card feature reveal" style="--d:0.24s"><span class="step-no">STEP 05</span><h3>We test and hand over</h3><p>Pressure- and flow-tested before we leave.</p></div></div>
 </div>
</section>

<section class="section" id="om-ai">
 <div class="container">
  <div class="card ai-promo reveal">
   <div>
    <span class="eyebrow">Meet OM AI</span>
    <h2>Answers in seconds. A human when you need one.</h2>
    <p class="muted">Describe your farm, bathroom or worksite and OM AI suggests the right products and starts your quotation — in English or Kiswahili. Prefer a person? Switch to Human mode and the OM team replies on WhatsApp.</p>
    <div class="hero-actions"><button class="btn btn-primary" type="button" data-chat-open>Chat with OM AI{ARROW}</button><button class="btn btn-outline" type="button" data-chat-open data-chat-mode="human">Talk to a human</button></div>
   </div>
   <div class="mode-cards">
    <div class="mode-card"><span class="ai-dot">{I["omai"]}</span><div><b>OM AI mode</b><small>Instant product advice, 24/7. Fills in your quote for you.</small></div></div>
    <div class="mode-card human"><span class="ai-dot">{I["headset"]}</span><div><b>Human mode</b><small>Leave a message for the OM team — we reply on WhatsApp.</small></div></div>
    <div class="mode-card"><span class="ai-dot">{I["globe"]}</span><div><b>English &amp; Kiswahili</b><small>Habari! Ask in whichever language you prefer.</small></div></div>
   </div>
  </div>
 </div>
</section>

<section class="section-sm" id="newsletter">
 <div class="container">
  <div class="card news-band reveal">
   <div><span class="eyebrow">Newsletter</span><h2>Stay in the flow.</h2><p class="muted">Farm-season tips, new merch colours and subscriber-only offers. Unsubscribe anytime.</p></div>
   <form data-newsletter novalidate>
    <div class="form-row"><label class="field">First name<input name="fname" autocomplete="given-name" maxlength="60" placeholder="Optional"></label><label class="field">Email *<input name="email" type="email" autocomplete="email" required maxlength="254" placeholder="you@example.com"></label></div>
    {interests_chips()}
    <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
    <button class="btn btn-primary btn-block" type="submit" style="margin-top:1rem">Subscribe</button>
    <p class="news-status form-status" role="status" aria-live="polite"></p>
   </form>
  </div>
 </div>
</section>

<section class="section section-alt" id="quote">
 <div class="container">
  <div class="section-head center reveal"><span class="eyebrow">Free quotation</span><h2>Get a quote in 4 quick steps.</h2><p>Tap what you need — it takes about a minute. No obligation.</p></div>
  <div class="card wizard reveal" id="quoteWizard">
   <ol class="wz-steps" aria-label="Quote progress">
    <li class="active" data-step-dot="1"><span>1</span><em>Service</em></li><li data-step-dot="2"><span>2</span><em>Details</em></li><li data-step-dot="3"><span>3</span><em>Location</em></li><li data-step-dot="4"><span>4</span><em>Contact</em></li>
   </ol>
   <form id="quoteForm" novalidate>
    <fieldset class="wz-step" data-step="1">
     <legend class="wz-title">What do you need a quote for?</legend>
     <div class="opt-grid">
      {"".join(f'<label class="opt-card"><input class="sr-only" type="radio" name="service" value="{v}" required><span class="ico">{I[ic]}</span><b>{t}</b><small>{sub}</small></label>' for ic, t, sub, v in [("wrench","Plumbing","Leaks, pipes, tanks, heaters",SERVICES[0]),("building","Construction","Build, renovate, site works",SERVICES[2]),("sprout","Irrigation","Drip, sprinklers, solar pumps",SERVICES[1]),("helmet","Workwear &amp; PPE","Crew kits, boots, vests",SERVICES[3]),("gift","Branded merch","Backpacks, notebooks",SERVICES[4]),("spark","Something else","Several or not sure",SERVICES[5])])}
     </div>
     <p class="form-status" data-step-msg></p>
    </fieldset>

    <fieldset class="wz-step" data-step="2" hidden>
     <legend class="wz-title">Tell us a little more <small id="wzServiceName"></small></legend>
     <div id="scopeGroups"></div>
     <div class="wz-label">Budget (optional)</div>
     <div class="chips chips-radio" role="radiogroup" aria-label="Budget">
      <label class="chip"><input class="sr-only" type="radio" name="budget" value="Not yet decided">Not sure yet</label>
      <label class="chip"><input class="sr-only" type="radio" name="budget" value="Below KSh 50,000">Under 50K</label>
      <label class="chip"><input class="sr-only" type="radio" name="budget" value="KSh 50,000 – 200,000">50K – 200K</label>
      <label class="chip"><input class="sr-only" type="radio" name="budget" value="KSh 200,000 – 500,000">200K – 500K</label>
      <label class="chip"><input class="sr-only" type="radio" name="budget" value="Above KSh 500,000">500K+</label>
     </div>
     <label class="field" style="margin-top:1rem"><span>Anything else? <span class="opt">(optional)</span></span><textarea name="details" rows="3" maxlength="5000" placeholder="Sizes, quantities, colours, site details…"></textarea></label>
     <div class="photo-tip">{I["whatsapp"]}<div><b>Have photos or plans?</b><small>After you send this request, tap <em>Send photos on WhatsApp</em> — your reference number is added automatically.</small></div></div>
    </fieldset>

    <fieldset class="wz-step" data-step="3" hidden>
     <legend class="wz-title">Where is the project? <span class="opt">(optional)</span></legend>
     <div class="loc-tools">
      <label class="field">County<select name="county" id="countySelect"><option value="">Choose a county</option></select></label>
      <div class="field town-field"><label for="townSearch">Town or area</label><div class="town-wrap"><input id="townSearch" name="town" type="search" autocomplete="off" placeholder="Search e.g. Naivasha, Kitengela…" maxlength="120" role="combobox" aria-expanded="false" aria-controls="townList" aria-autocomplete="list"><ul class="town-list" id="townList" role="listbox" hidden></ul></div></div>
     </div>
     <div class="map-wrap"><div id="kenyaMap" class="kenya-map" role="application" aria-label="Map of Kenya. Tap to drop a pin on your project site."></div>
      <button class="btn btn-outline btn-sm map-locate" type="button" id="useMyLocation">{I["target"]} Use my location</button></div>
     <p class="map-hint" id="pinLabel">Tap the map to drop a pin on your site — or just pick a county.</p>
    </fieldset>

    <fieldset class="wz-step" data-step="4" hidden>
     <legend class="wz-title">How do we reach you?</legend>
     <div class="form-row"><label class="field">Full name *<input name="name" type="text" placeholder="Your name" autocomplete="name" required maxlength="120"></label><label class="field">Phone / WhatsApp *<input name="phone" type="tel" placeholder="e.g. 0712 345 678" autocomplete="tel" required maxlength="40"></label></div>
     <div class="form-row"><label class="field"><span>Email <span class="opt">(optional)</span></span><input name="email" type="email" placeholder="you@example.com" autocomplete="email" maxlength="254"></label><label class="field"><span>Company <span class="opt">(optional)</span></span><input name="company" type="text" autocomplete="organization" maxlength="120"></label></div>
     <div class="wz-summary" id="wzSummary"></div>
     <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
     <label class="consent"><input type="checkbox" name="consent" required><span>I agree that OM Ltd may contact me about this request.</span></label>
    </fieldset>

    <div class="wz-nav">
     <button class="btn btn-outline" type="button" id="wzBack" hidden>Back</button>
     <span class="wz-count" id="wzCount">Step 1 of 4</span>
     <button class="btn btn-primary" type="button" id="wzNext">Continue{ARROW}</button>
     <button class="btn btn-primary" type="submit" id="wzSubmit" hidden><span class="spinner"></span><span class="submit-label">Send my request</span></button>
    </div>
    <div class="progress" id="uploadProgress"><span></span></div>
    <p class="form-status" id="formStatus" role="status" aria-live="polite"></p>
   </form>
   <div class="success-panel" id="quoteSuccess">
    <div class="check">{I["check"]}</div><h3>Request received!</h3>
    <p>Thank you — the OM team will contact you soon.<br>Your reference: <span class="ref-code" id="refCode">—</span></p>
    <div class="hero-actions" style="justify-content:center;margin:0"><button class="btn btn-outline" type="button" id="newQuote">Start another quote</button><a class="btn btn-primary" id="waFollow" href="https://wa.me/254714995749" target="_blank" rel="noopener">{I["whatsapp"]} Send photos on WhatsApp</a></div>
   </div>
  </div>
  <p class="quote-alt reveal">Open Mon–Sat, 8:00 am – 6:00 pm · emergencies 24 hours.<br>Prefer to talk? <a href="https://wa.me/254714995749" target="_blank" rel="noopener" data-track="whatsapp_click">WhatsApp +254 714 995 749</a> · <a href="mailto:oandmlimited@gmail.com">oandmlimited@gmail.com</a> · <a href="#" data-chat-open data-chat-mode="human">Message the team</a></p>
 </div>
</section>
''' + footer()


def merch():
    bp = [("black", "Stealth Black", "#15171c"), ("blue", "Midnight Blue", "#1d3a7a"), ("green", "Forest Green", "#2f5a35"),
          ("grey", "Graphite Grey", "#5b6170"), ("white", "Arctic White", "#e9edf3"), ("lime", "Cyber Lime", "#c8f43c")]
    nb = [("black", "Midnight Black", "#14161b"), ("green", "Forest Green", "#2a4a33"), ("blue", "Ocean Blue", "#1b3466"),
          ("grey", "Stone Grey", "#4b505c"), ("white", "Arctic White", "#eef1f6")]
    sw = lambda pre, cols, lim=None: "".join(f'<button class="swatch" type="button" style="--c:{c}" data-img="assets/products/{pre}-{k}.webp" data-name="{n}"{" data-limited=\"1\"" if k == lim else ""} aria-pressed="{"true" if i == 0 else "false"}" aria-label="{n}"></button>' for i, (k, n, c) in enumerate(cols))
    ww = [("ww-coveralls", "Workwear", "OM coveralls", "Reflective-taped, full-body protection."), ("ww-vests", "Workwear", "Hi-vis safety vests", "Bright, reflective and comfortable."),
          ("ww-polos", "Workwear", "Branded polo shirts", "Navy and grey polos with the OM mark."), ("ww-jackets", "Workwear", "Hi-vis jackets", "Two-tone reflective jackets."),
          ("ww-boots", "PPE", "Safety boots", "Steel-toe, slip-resistant soles."), ("ww-ppe", "PPE", "PPE accessories", "Hard hats, glasses and gloves.")]
    ir = [("ir-drip", "Farm", "Drip irrigation kits", "Water straight to the root — less waste."), ("ir-sprinkler", "Farm", "Sprinkler systems", "Even coverage for crops and lawns."),
          ("ir-pipes", "Farm", "Water pipes &amp; fittings", "HDPE and PVC with matching fittings."), ("ir-pumps", "Farm", "Water pumps", "For boreholes, tanks and rivers."),
          ("ir-controllers", "Farm", "Irrigation controllers", "Automate watering, save labour."), ("ir-hoses", "Farm", "Garden hoses", "Durable hoses, reels and nozzles."),
          ("ir-inputs", "Farm", "Fertilizers &amp; inputs", "Quality inputs to boost yield."), ("flow-pipes", "Flow", "Premium PVC pipes", "Leak-proof, long-lasting pipework.")]
    svc_for = lambda k: SERVICES[3] if k in ("Workwear", "PPE") else SERVICES[1]
    grid = lambda items, cls: f'<div class="grid {cls}">' + "".join(tile(f"assets/products/{i}.webp", k, t, d_, service=svc_for(k), add=t.replace("&amp;", "&"), d=n * .04) for n, (i, k, t, d_) in enumerate(items)) + "</div>"

    return head("Shop & Merch | OM Ltd", "OM smart backpacks, premium notebooks, branded workwear, PPE and irrigation gear. Pick a colour and request a quote.", "merch") + f'''
<section class="page-hero"><div class="container">
 <span class="eyebrow">The OM collection</span>
 <h1>Carry ideas. Connect possibilities.</h1>
 <p>Branded gear for professionals and crews — plus the workwear and farm kit OM is known for. Add items to your enquiry list and get one combined quotation.</p>
</div></section>
<section class="section-sm" style="padding-top:0"><div class="container">
 <div class="tabs-wrap"><div class="tabs" role="tablist" aria-label="Product categories">
  <button class="tab" role="tab" aria-selected="true" aria-controls="p-gear" id="t-gear" data-hash="gear">Signature gear</button>
  <button class="tab" role="tab" aria-selected="false" aria-controls="p-workwear" id="t-workwear" data-hash="workwear">Workwear &amp; PPE</button>
  <button class="tab" role="tab" aria-selected="false" aria-controls="p-farm" id="t-farm" data-hash="farm">Farm &amp; irrigation</button>
 </div></div>

 <div class="panel" id="p-gear" role="tabpanel" aria-labelledby="t-gear">
  <article class="card product-hero reveal" data-product="OM Smart Backpack">
   <div class="product-stage"><img src="assets/products/backpack-hero.webp" alt="OM Smart Backpack" data-main></div>
   <div class="product-info">
    <span class="tag">Signature merch · New</span><h2>OM Smart Backpack</h2>
    <p>Smart, durable and functional — built to move with you from the commute to the field.</p>
    <div class="feature-chips"><span>Fits 15.6" laptops</span><span>USB charging port</span><span>Water resistant</span><span>Anti-theft pocket</span><span>Luggage strap</span></div>
    <div class="swatch-label">Colour: <b data-colour-name>Stealth Black</b></div>
    <div class="swatches" role="group" aria-label="Backpack colour">{sw("backpack", bp, "lime")}</div>
    <dl class="spec-list"><div><dt>Material</dt><dd>Premium polyester</dd></div><div><dt>Capacity</dt><dd>20–35 L</dd></div><div><dt>Size</dt><dd>45 × 32 × 18 cm</dd></div><div><dt>Weight</dt><dd>1.0 kg</dd></div><div><dt>Packaging</dt><dd>Eco gift box</dd></div><div><dt>Warranty</dt><dd>1 year limited</dd></div></dl>
    <div class="hero-actions" style="margin-top:0"><button class="btn btn-primary" type="button" data-add-hero>Add to enquiry</button><button class="btn btn-outline" type="button" data-lightbox-src="assets/poster-backpack.webp">View poster</button></div>
   </div>
  </article>
  <article class="card product-hero reveal" data-product="OM Premium Notebook">
   <div class="product-stage"><img src="assets/products/notebook-hero.webp" alt="OM Premium Notebook" data-main></div>
   <div class="product-info">
    <span class="tag">Signature merch · Gift-ready</span><h2>OM Premium Notebook</h2>
    <p>Ideas. Planned. Connected. A PU-leather A5 notebook with an embossed OM logo, elastic closure and pen loop.</p>
    <div class="feature-chips"><span>192 lined pages</span><span>100 GSM paper</span><span>Lay-flat binding</span><span>Ribbon bookmark</span><span>Back pocket</span></div>
    <div class="swatch-label">Colour: <b data-colour-name>Midnight Black</b></div>
    <div class="swatches" role="group" aria-label="Notebook colour">{sw("notebook", nb)}</div>
    <dl class="spec-list"><div><dt>Cover</dt><dd>PU leather</dd></div><div><dt>Size</dt><dd>A5 (14.5 × 21 cm)</dd></div><div><dt>Pages</dt><dd>192 lined</dd></div><div><dt>Closure</dt><dd>Elastic band</dd></div></dl>
    <div class="hero-actions" style="margin-top:0"><button class="btn btn-primary" type="button" data-add-hero>Add to enquiry</button><button class="btn btn-outline" type="button" data-lightbox-src="assets/poster-notebook.webp">View poster</button></div>
   </div>
  </article>
  <div class="card cta-band reveal"><h2>Your logo, our craft.</h2><p>Backpacks, notebooks or polos branded for your team, school or event — tell us the quantity and deadline.</p><div class="hero-actions"><a class="btn btn-primary service-quote" data-service="{SERVICES[4]}" href="index.html#quote">Get a corporate quote{ARROW}</a><button class="btn btn-outline" type="button" data-chat-open data-chat-ask="I need branded merchandise for 50 staff. What can OM make?">Ask OM AI for ideas</button></div></div>
 </div>

 <div class="panel" id="p-workwear" role="tabpanel" aria-labelledby="t-workwear" hidden>
  <div class="card cat-banner"><div class="photo"><img src="assets/people/pair.webp" alt="Two OM crew members in hi-vis vests, coveralls and hard hats" loading="lazy" style="object-position:50% 20%"></div><div class="copy"><span class="eyebrow">Overall wear &amp; safety</span><h2>Work smart. Stay safe.</h2><p>High-quality workwear and PPE for a safer, more productive workplace — branded with your logo or ours.</p></div></div>
  {grid(ww, "grid-3")}
 </div>

 <div class="panel" id="p-farm" role="tabpanel" aria-labelledby="t-farm" hidden>
  <div class="card cat-banner"><div class="photo"><img src="assets/people/farmer.webp" alt="A farmer in a field watered by OM sprinklers" loading="lazy" style="object-position:40% 30%"></div><div class="copy"><span class="eyebrow">Irrigation &amp; farm solutions</span><h2>Grow more. Worry less.</h2><p>Smart irrigation and quality farm supplies, with expert installation and support.</p><button class="btn btn-outline" type="button" style="align-self:flex-start" data-chat-open data-chat-ask="I want to irrigate a 1 acre farm. What do you recommend?">Plan my irrigation with OM AI</button></div></div>
  {grid(ir, "grid-4")}
 </div>
</div></section>
<div class="tray" id="tray" role="region" aria-label="Enquiry list"><span class="tray-count" id="trayCount">0</span><span class="tray-text" id="trayText"></span><button class="tray-clear" type="button" id="trayClear">Clear</button><a class="btn btn-primary btn-sm" href="index.html#quote">Request quote</a></div>
''' + footer()


def founders():
    people = [
        ("JS", "John Senteu", "assets/founders/john.webp", "Co-founder", "Managing Director", "Experienced in building partnerships, with a track record of successfully delivering high-stakes projects."),
        ("DM", "Eng. Dickson Monyatet", "assets/founders/dickson.webp", "Co-founder", "Engineer", "Over 10 years in plumbing systems installation, maintenance and repair."),
        ("IO", "Eng. Ian A. Ombui", "assets/founders/ian.webp", "Co-founder", "Engineer · Irrigation systems &amp; client consultation", "Designs irrigation systems for farms and guides clients from first consultation to a working system."),
        ("IO", "Isaiah Okara", "assets/founders/isaiah.webp", "Co-founder", "Water Mechanics Technologist", "New technology and modern design."),
    ]
    av = lambda a, n, ph: f'<div class="avatar photo"><img src="{ph}?v=2" alt="{n}" width="160" height="160" loading="lazy"></div>' if ph else f'<div class="avatar">{a}</div>'
    cards = "".join(f'<article class="card founder reveal" style="--d:{i*.06:.2f}s">{av(a, n, ph)}<span class="role">{r}</span><h2>{n}</h2><p>{t}</p><small>{bio}</small></article>' for i, (a, n, ph, r, t, bio) in enumerate(people))
    return head("Founders | OM Ltd", "Meet the founders of OM Ltd — John Senteu, Dickson Monyatet, Ian Ombui and Isaiah Okara.", "founders") + f'''
<section class="page-hero"><div class="container"><span class="eyebrow">The people behind OM</span><h1>Meet our founders.</h1><p>Four founders building practical water, farm and workplace solutions — and a brand that carries beyond the job site.</p></div></section>
<section class="section-sm" style="padding-top:0"><div class="container"><div class="grid grid-4">{cards}</div></div></section>
<section class="section section-alt"><div class="container">
 <div class="section-head center reveal"><span class="eyebrow">What drives us</span><h2>Build · Flow · Thrive.</h2></div>
 <div class="grid grid-3">
  <div class="card feature reveal"><span class="ico">{I["shield"]}</span><h3>Quality guaranteed</h3><p>Durable, high-performance products chosen for long-term use.</p></div>
  <div class="card feature reveal" style="--d:.06s"><span class="ico">{I["users"]}</span><h3>Trusted partner</h3><p>One point of contact from first enquiry to delivery and support.</p></div>
  <div class="card feature reveal" style="--d:.12s"><span class="ico">{I["leaf"]}</span><h3>Smart &amp; sustainable</h3><p>Water-saving systems and eco-friendly packaging.</p></div>
 </div>
</div></section>
<section class="section"><div class="container"><div class="card cta-band reveal"><h2>Building solutions with purpose.</h2><p>Connect with OM Ltd to discuss your project or a partnership.</p><div class="hero-actions"><a class="btn btn-primary" href="index.html#quote">Contact OM Ltd{ARROW}</a><a class="btn btn-outline" href="https://wa.me/254714995749" target="_blank" rel="noopener">WhatsApp us</a></div></div></div></section>
''' + footer()


def testimonials():
    stars = "".join(f'<input type="radio" name="rating" id="r{n}" value="{n}"><label for="r{n}" title="{n} stars">★</label>' for n in range(5, 0, -1))
    return head("Reviews | OM Ltd", "Verified customer feedback for OM Ltd — and a place to share your own experience.", "testimonials") + f'''
<section class="page-hero"><div class="container"><span class="eyebrow">Customer feedback</span><h1>Experiences that matter.</h1><p>Every review here is from a real OM customer and is published only with their permission.</p></div></section>
<section class="section-sm" style="padding-top:0"><div class="container">
 <div class="grid grid-3" id="reviews" aria-live="polite"></div>
 <div class="card empty-state reveal" id="reviewsEmpty"><h2>Be the first to share your OM experience.</h2><p>Have we supplied a product or supported your project? Approved reviews appear here.</p><a class="btn btn-outline" href="#share">Write a review</a></div>
</div></section>
<section class="section section-alt" id="share"><div class="container quote-grid">
 <div class="quote-intro reveal"><span class="eyebrow">Share your story</span><h2>Your feedback, our progress.</h2><p class="muted">Reviews are checked by the OM team before they go live. We never invent or edit customer reviews.</p>
  <div class="contact-list"><div class="card contact-item"><span class="ico">{I["whatsapp"]}</span><div><small>Prefer WhatsApp?</small><a href="https://wa.me/254714995749?text=Hello%20OM%20Ltd%2C%20I%20would%20like%20to%20share%20feedback." target="_blank" rel="noopener">Send feedback on WhatsApp</a></div></div></div></div>
 <div class="card form-card reveal" style="--d:.08s">
  <form id="reviewForm" novalidate>
   <div class="form-head"><h3>Write a review</h3><small>* required</small></div>
   <fieldset style="border:0;padding:0;margin:0"><legend class="field" style="margin-bottom:.2rem">Your rating *</legend><div class="star-input">{stars}</div></fieldset>
   <div class="form-row"><label class="field">Name to display *<input name="name" required maxlength="80" placeholder="e.g. Jane W."></label><label class="field">Organisation / town<input name="org" maxlength="80" placeholder="Optional"></label></div>
   <label class="field">Product or service<select name="service"><option value="">Select</option><option>Plumbing</option><option>Construction &amp; renovation</option><option>Irrigation &amp; farm supplies</option><option>Workwear &amp; safety</option><option>Branded merchandise</option></select></label>
   <label class="field">Your review *<textarea name="message" required minlength="10" maxlength="1200" placeholder="What did OM do for you?"></textarea></label>
   <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
   <label class="consent"><input type="checkbox" name="consent" required><span>I give OM Ltd permission to publish this review with the name above.</span></label>
   <button class="btn btn-primary btn-block" type="submit"><span class="spinner"></span><span class="submit-label">Submit review</span></button>
   <p class="form-status" id="reviewStatus" role="status" aria-live="polite"></p>
  </form>
 </div>
</div></section>
''' + footer()


def newsletter():
    return head("Newsletter | OM Ltd", "Join the OM Ltd newsletter for farm-season tips, merch drops and offers — or manage your subscription.", "newsletter") + f'''
<section class="page-hero"><div class="container"><span class="eyebrow">The OM newsletter</span><h1>Good things flow to your inbox.</h1><p>Seasonal irrigation guides, new merch colours, safety checklists and subscriber-only offers.</p></div></section>
<section class="section-sm" style="padding-top:0"><div class="container">
 <div class="grid grid-3" style="margin-bottom:1.25rem">
  <div class="card feature reveal"><span class="ico">{I["sprout"]}</span><h3>Grow smarter</h3><p>When to water, what to plant and how to keep drip lines clean.</p></div>
  <div class="card feature reveal" style="--d:.06s"><span class="ico">{I["gift"]}</span><h3>Merch drops first</h3><p>Early access to new backpack and notebook colours.</p></div>
  <div class="card feature reveal" style="--d:.12s"><span class="ico">{I["shield"]}</span><h3>Safety reminders</h3><p>PPE checklists and site-safety tips your crew will read.</p></div>
 </div>
 <div class="grid grid-2">
  <div class="card form-card reveal"><form data-newsletter novalidate>
   <div class="form-head"><h3>Subscribe</h3><small>* required</small></div>
   <div class="form-row"><label class="field">First name<input name="fname" autocomplete="given-name" maxlength="60" placeholder="Optional"></label><label class="field">Email *<input name="email" type="email" autocomplete="email" required maxlength="254" placeholder="you@example.com"></label></div>
   <fieldset style="border:0;padding:0;margin:0 0 1rem"><legend class="field" style="margin-bottom:.4rem">Topics</legend>{interests_chips()}</fieldset>
   <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
   <label class="consent"><input type="checkbox" name="consent" required><span>I'd like to receive emails from OM Ltd. I can unsubscribe at any time.</span></label>
   <button class="btn btn-primary btn-block" type="submit">Subscribe</button>
   <p class="form-status" role="status" aria-live="polite"></p>
  </form></div>
  <div class="card form-card reveal" id="unsubscribe" style="--d:.08s"><form id="unsubForm" novalidate>
   <div class="form-head"><h3>Unsubscribe</h3><small>Removed within 48 hours</small></div>
   <label class="field">Email *<input name="email" type="email" autocomplete="email" required maxlength="254" placeholder="you@example.com"></label>
   <label class="field">Anything we could do better?<textarea name="reason" maxlength="300" rows="3" placeholder="Optional"></textarea></label>
   <button class="btn btn-outline btn-block" type="submit">Unsubscribe me</button>
   <p class="form-status" id="unsubStatus" role="status" aria-live="polite"></p>
  </form></div>
 </div>
</div></section>
''' + footer()


def admin():
    return head("Team dashboard | OM Ltd", "OM Ltd team dashboard.", "admin", '\n<meta name="robots" content="noindex,nofollow">') + f'''
<section class="admin-shell"><div class="container">
 <div class="card admin-login" id="adminLogin">
  <span class="ai-dot" style="margin:0 auto;width:56px;height:56px;border-radius:16px">{I["omai"]}</span>
  <h1>OM team dashboard</h1>
  <p id="adminMsg">Sign in with your OM Google account to view quotes, live chats, subscribers and reviews.</p>
  <button class="btn btn-outline btn-block" type="button" id="googleSignIn">{I["google"]} Sign in with Google</button>
 </div>
 <div id="adminApp" hidden>
  <div class="admin-top"><div><span class="eyebrow">Live from Firestore</span><h1 style="margin-top:.4rem">Hello, <span class="accent" id="adminName">team</span></h1></div><div class="hero-actions" style="margin:0"><button class="btn btn-outline btn-sm" type="button" id="exportCsv">Export quotes CSV</button><button class="btn btn-outline btn-sm" type="button" id="signOut">Sign out</button></div></div>
  <div class="kpis"><div class="card kpi"><small>Quotes</small><b id="kTotal">0</b></div><div class="card kpi"><small>New quotes</small><b id="kNew">0</b></div><div class="card kpi"><small>Human chats</small><b id="kChats">0</b></div><div class="card kpi"><small>Subscribers</small><b id="kSubs">0</b></div><div class="card kpi"><small>Pending reviews</small><b id="kReviews">0</b></div></div>
  <div class="tabs-wrap admin-tabs"><div class="tabs" role="tablist">
   <button class="tab" role="tab" type="button" aria-selected="true" data-admin-tab="quotes">Quotations</button>
   <button class="tab" role="tab" type="button" aria-selected="false" data-admin-tab="chats">Human chats</button>
   <button class="tab" role="tab" type="button" aria-selected="false" data-admin-tab="reviews">Reviews</button>
   <button class="tab" role="tab" type="button" aria-selected="false" data-admin-tab="subs">Subscribers</button>
   <button class="tab" role="tab" type="button" aria-selected="false" data-admin-tab="compose">Compose newsletter</button>
  </div></div>
  <div class="card table-card" data-admin-panel="quotes"><table class="data"><thead><tr><th>Date</th><th>Ref</th><th>Customer</th><th>Service</th><th>Details</th><th>Files</th><th>Status</th></tr></thead><tbody id="quotesBody"><tr><td colspan="7" class="muted">Loading…</td></tr></tbody></table></div>
  <div class="card table-card" data-admin-panel="chats" hidden><table class="data"><thead><tr><th>Date</th><th>Customer</th><th>Message</th><th>Context</th><th>Status</th><th></th></tr></thead><tbody id="chatsBody"></tbody></table></div>
  <div class="card table-card" data-admin-panel="reviews" hidden><table class="data"><thead><tr><th>Date</th><th>Name</th><th>Rating</th><th>Review</th><th>Status</th><th></th></tr></thead><tbody id="reviewsBody"></tbody></table></div>
  <div class="card table-card" data-admin-panel="subs" hidden><div class="admin-top" style="margin-bottom:.6rem"><small class="muted">Unsubscribed emails are excluded automatically.</small><button class="btn btn-outline btn-sm" type="button" id="exportSubs">Export subscribers CSV</button></div><table class="data"><thead><tr><th>Date</th><th>Email</th><th>Name</th><th>Interests</th><th>Status</th></tr></thead><tbody id="subsBody"></tbody></table></div>
  <div class="card form-card" data-admin-panel="compose" hidden>
   <div class="grid grid-2">
    <form id="composeForm" novalidate>
     <div class="form-head"><h3>New newsletter</h3><small>Free — sends from your own Gmail</small></div>
     <label class="field">Audience<select name="audience"><option value="all">All active subscribers</option><option value="farm">Farm &amp; irrigation</option><option value="plumbing">Plumbing</option><option value="safety">Safety &amp; workwear</option><option value="merch">Merch drops</option></select></label>
     <label class="field">Subject *<input name="subject" required maxlength="140" placeholder="e.g. New Cyber Lime backpacks have landed"></label>
     <label class="field">Headline *<input name="headline" required maxlength="120"></label>
     <label class="field">Message *<textarea name="body" required rows="8" maxlength="6000" placeholder="Blank lines become paragraphs."></textarea></label>
     <div class="form-row"><label class="field">Button text<input name="ctaText" maxlength="40" placeholder="Shop the drop"></label><label class="field">Button link<input name="ctaUrl" type="url" maxlength="300" placeholder="https://…/merch"></label></div>
     <div class="hero-actions" style="margin-top:.2rem"><button class="btn btn-primary" type="submit"><span class="spinner"></span><span class="submit-label">Prepare to send</span></button><button class="btn btn-outline" type="button" id="exportMailchimp">Export for Mailchimp</button></div>
     <ol class="send-steps" id="sendSteps" hidden>
      <li><b>Copy the recipients</b> <button class="btn btn-soft btn-sm" type="button" id="copyBcc">Copy emails</button><small id="bccInfo"></small></li>
      <li><b>Open Gmail</b> with your subject and message filled in <a class="btn btn-soft btn-sm" id="openGmail" target="_blank" rel="noopener">Open Gmail</a></li>
      <li><b>Paste the emails into “Bcc”</b> (never “To” — keeps subscribers private) and press Send. <small>Gmail sends up to ~500 emails a day for free; bigger lists → use “Export for Mailchimp” (free up to 500 contacts).</small></li>
      <li><button class="btn btn-outline btn-sm" type="button" id="markSent">I've sent it — log this campaign</button></li>
     </ol>
     <p class="form-status" id="composeStatus" role="status" aria-live="polite"></p>
    </form>
    <div><div class="form-head"><h3>Preview</h3><small id="audienceCount">—</small></div><iframe id="nlPreview" title="Newsletter preview" style="width:100%;height:600px;border:0;border-radius:12px;background:#fff"></iframe></div>
   </div>
   <h3 style="font-size:1.05rem;margin:1.4rem 0 .6rem">Sent campaigns</h3>
   <div class="table-card" style="padding:0"><table class="data"><thead><tr><th>Date</th><th>Subject</th><th>Audience</th><th>Recipients</th><th>By</th></tr></thead><tbody id="campaignsBody"></tbody></table></div>
  </div>
 </div>
</div></section>
<script type="module" src="js/admin.js?v={VERSION}"></script>
''' + footer()


def notfound():
    return head("Page not found | OM Ltd", "This page doesn't exist.", "404") + f'''
<section class="page-hero" style="min-height:55vh;display:grid;place-items:center"><div class="container">
 <span class="eyebrow">Error 404</span><h1>This pipe leads nowhere.</h1><p>We couldn't find that page. Let's get you flowing again.</p>
 <div class="hero-actions" style="justify-content:center"><a class="btn btn-primary" href="index.html">Back home{ARROW}</a><button class="btn btn-outline" type="button" data-chat-open>Ask OM AI</button></div>
</div></section>
''' + footer()


PAGES = {"index.html": index, "merch.html": merch, "founders.html": founders, "testimonials.html": testimonials,
         "newsletter.html": newsletter, "admin.html": admin, "404.html": notfound}
for name, fn in PAGES.items():
    (OUT / name).write_text(fn(), encoding="utf-8")
    print("wrote", name)
