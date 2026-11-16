#!/usr/bin/env python3
"""Builds the OM Ltd static pages from shared partials.
Run:  python3 build/build.py   (outputs into ../om)
"""
from pathlib import Path
import sys

OUT = Path(sys.argv[1] if len(sys.argv) > 1 else Path(__file__).resolve().parent.parent)
VERSION = "2.0.2"

# ------------------------------------------------------------------ icons
I = {
 "arrow": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>',
 "drop": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.7s-6.5 7.1-6.5 11.8a6.5 6.5 0 0 0 13 0C18.5 9.8 12 2.7 12 2.7z"/><path d="M9 15a3 3 0 0 0 3 3"/></svg>',
 "wrench": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.2L3 17.8V21h3.2l6.3-6.3a4 4 0 0 0 5.2-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/></svg>',
 "sprout": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21v-9"/><path d="M12 12C12 7 8 4 3 4c0 5 4 8 9 8z"/><path d="M12 14c0-4 3-7 8-7 0 4-3 7-8 7z"/></svg>',
 "tank": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="7" ry="2.5"/><path d="M5 5v13c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V5"/><path d="M5 11.5c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5"/></svg>',
 "helmet": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17h18v2H3z"/><path d="M5 17v-3a7 7 0 0 1 14 0v3"/><path d="M10 7.3V11M14 7.3V11"/></svg>',
 "gift": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v9h14v-9M12 8v13"/><path d="M12 8S10.5 3 8 3a2.5 2.5 0 0 0 0 5M12 8s1.5-5 4-5a2.5 2.5 0 0 1 0 5"/></svg>',
 "home": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></svg>',
 "building": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1M10 21v-3h4v3"/></svg>',
 "factory": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21V10l6 4V10l6 4V5h4v16z"/><path d="M7 17h2M12 17h2"/></svg>',
 "field": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20h20"/><path d="M6 20c0-5 2-8 6-10M18 20c0-5-2-8-6-10M12 20v-10"/><circle cx="18" cy="5" r="2"/></svg>',
 "shield": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/></svg>',
 "bolt": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg>',
 "chat": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>',
 "mail": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
 "phone": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>',
 "upload": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/></svg>',
 "check": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
 "plus": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
 "send": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 3L10 14"/><path d="M21 3l-7 18-4-7-7-4z"/></svg>',
 "x": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
 "refresh": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 15.5-6.3L21 8M21 3v5h-5M21 12a9 9 0 0 1-15.5 6.3L3 16M3 21v-5h5"/></svg>',
 "up": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
 "spark": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 17l.8 2.2L22 20l-2.2.8L19 23l-.8-2.2L16 20l2.2-.8z"/></svg>',
 "globe": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>',
 "clock": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
 "leaf": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 19c0-9 6-14 15-14 0 9-5 15-14 15"/><path d="M5 19l7-7"/></svg>',
 "users": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.2A6.5 6.5 0 0 1 21.5 20"/></svg>',
 "target": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>',
 "whatsapp": '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.4-.3z"/></svg>',
 "x-social": '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.2-8.3L1.8 3h6.4l4.4 5.8zm-1.1 16.2h1.7L7.4 4.7H5.6z"/></svg>',
 "instagram": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
 "tiktok": '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 3c.4 2.2 1.8 3.7 4 3.9v3.1a7.4 7.4 0 0 1-4-1.3v6.4a6 6 0 1 1-6-6h.6v3.2a2.9 2.9 0 1 0 2.2 2.8V3z"/></svg>',
 "facebook": '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 8.5V6.8c0-.8.2-1.3 1.4-1.3H17V2.3A22 22 0 0 0 14.6 2C12.2 2 10.7 3.5 10.7 6.1v2.4H8v3.3h2.7V22H14V11.8h2.7l.4-3.3z"/></svg>',
 "google": '<svg viewBox="0 0 24 24"><path fill="#4285F4" d="M22 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.6a4.8 4.8 0 0 1-2.1 3.1v2.6h3.4c2-1.8 3.1-4.5 3.1-7.5z"/><path fill="#34A853" d="M12 22.5c2.8 0 5.2-.9 6.9-2.5l-3.4-2.6c-.9.6-2.1 1-3.5 1-2.7 0-5-1.8-5.8-4.3H2.7V17A10.4 10.4 0 0 0 12 22.5z"/><path fill="#FBBC05" d="M6.2 14.1a6.2 6.2 0 0 1 0-4.1V7.3H2.7a10.4 10.4 0 0 0 0 9.4z"/><path fill="#EA4335" d="M12 5.6c1.5 0 2.9.5 4 1.6l3-3A10.4 10.4 0 0 0 2.7 7.3L6.2 10c.8-2.5 3.1-4.4 5.8-4.4z"/></svg>',
}

def bot(uid="h", cls="mo-bot", wave=True, title="Mo AI robot"):
    """OM's robot mascot — a friendly water-drop bot."""
    w = 'class="arm-wave"' if wave else ''
    return f'''<svg class="{cls}" viewBox="0 0 200 230" role="img" aria-label="{title}" xmlns="http://www.w3.org/2000/svg">
<defs>
 <linearGradient id="shell-{uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#c9dcff"/></linearGradient>
 <linearGradient id="visor-{uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0a1f5c"/><stop offset="1" stop-color="#030a1f"/></linearGradient>
 <linearGradient id="drop-{uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fe5ff"/><stop offset="1" stop-color="#1a6bff"/></linearGradient>
 <radialGradient id="jet-{uid}" cx=".5" cy=".3" r=".7"><stop offset="0" stop-color="#7fe5ff" stop-opacity=".9"/><stop offset="1" stop-color="#1a6bff" stop-opacity="0"/></radialGradient>
</defs>
<ellipse cx="100" cy="218" rx="46" ry="8" fill="#000" opacity=".25"/>
<ellipse cx="100" cy="206" rx="22" ry="14" fill="url(#jet-{uid})"/>
<line x1="100" y1="44" x2="100" y2="22" stroke="#c9dcff" stroke-width="4" stroke-linecap="round"/>
<path class="antenna-tip" d="M100 4s-9 9.5-9 15.5a9 9 0 0 0 18 0C109 13.5 100 4 100 4z" fill="url(#drop-{uid})"/>
<rect x="30" y="74" width="14" height="30" rx="7" fill="#1a6bff"/>
<rect x="156" y="74" width="14" height="30" rx="7" fill="#1a6bff"/>
<rect x="38" y="42" width="124" height="94" rx="38" fill="url(#shell-{uid})"/>
<rect x="52" y="58" width="96" height="58" rx="26" fill="url(#visor-{uid})"/>
<rect x="56" y="61" width="44" height="10" rx="5" fill="#fff" opacity=".08"/>
<g class="pupils">
 <g class="eye"><ellipse cx="80" cy="85" rx="10" ry="12" fill="#2ad1ff"/><circle cx="83" cy="80" r="3.4" fill="#fff"/></g>
 <g class="eye"><ellipse cx="120" cy="85" rx="10" ry="12" fill="#2ad1ff"/><circle cx="123" cy="80" r="3.4" fill="#fff"/></g>
</g>
<rect class="mouth" x="91" y="102" width="18" height="5" rx="2.5" fill="#c8f43c"/>
<circle cx="64" cy="104" r="5" fill="#2ad1ff" opacity=".3"/><circle cx="136" cy="104" r="5" fill="#2ad1ff" opacity=".3"/>
<rect x="88" y="134" width="24" height="10" rx="4" fill="#9db7e8"/>
<path d="M58 168c0-17 13-26 42-26s42 9 42 26v6c0 12-12 20-42 20s-42-8-42-20z" fill="url(#shell-{uid})"/>
<path class="chest-drop" d="M100 152s-10 10.5-10 17a10 10 0 0 0 20 0c0-6.5-10-17-10-17z" fill="url(#drop-{uid})"/>
<path d="M96 168a4 4 0 0 0 4 4" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" opacity=".8"/>
<path d="M60 160c-12 4-18 14-18 26" stroke="#c9dcff" stroke-width="11" stroke-linecap="round" fill="none"/>
<circle cx="42" cy="188" r="8" fill="#1a6bff"/>
<g {w}><path d="M140 160c12-4 20-14 22-30" stroke="#c9dcff" stroke-width="11" stroke-linecap="round" fill="none"/><circle cx="163" cy="126" r="8" fill="#1a6bff"/></g>
</svg>'''

# ------------------------------------------------------------------ partials
NAV = [("index.html#services", "Services", "home"), ("merch.html", "Shop & Merch", "merch"),
       ("founders.html", "Founders", "founders"), ("testimonials.html", "Reviews", "testimonials")]

def head(title, desc, page):
    return f'''<!doctype html>
<html lang="en" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#030a1f">
<meta property="og:type" content="website">
<meta property="og:site_name" content="OM Ltd">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="assets/poster-flow.webp">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@OMlimiteds">
<link rel="icon" type="image/png" href="assets/favicon.png">
<link rel="apple-touch-icon" href="assets/icon-192.png">
<link rel="manifest" href="manifest.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Sora:wght@500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="styles.css?v={VERSION}">
<script>document.documentElement.classList.replace('no-js','js')</script>
</head>
<body data-page="{page}">
<a class="skip-link" href="#main">Skip to content</a>
<div class="bg-scene" aria-hidden="true"><div class="orb orb-a"></div><div class="orb orb-b"></div><div class="orb orb-c"></div><div class="bg-grid"></div><div class="bg-drops"></div></div>
<div class="spotlight" aria-hidden="true"></div>
<div class="announcement" id="announcement"><span id="announcementText">Smart water solutions · Reliable supply · Professional service</span><a href="index.html#quote">Request a quotation →</a></div>
<header class="site-header">
 <div class="container nav-wrap">
  <a class="brand" href="index.html" aria-label="OM Ltd home"><img src="assets/om-mark.png" alt="" width="52" height="36"><span class="brand-copy"><strong>OM Ltd</strong><small>Quality Water Solutions</small></span></a>
  <button class="menu-toggle" aria-label="Open navigation" aria-expanded="false" aria-controls="mainNav"><span></span><span></span><span></span></button>
  <nav class="main-nav" id="mainNav" aria-label="Main">
   {''.join(f'<a href="{h}"{" aria-current=\"page\"" if k == page else ""}>{t}</a>' for h, t, k in NAV)}
   <a href="#" class="nav-mo" data-mo-open>{bot("nav", "mo-bot mini-bot", False, "")}Ask Mo AI</a>
   <a class="btn btn-primary btn-sm" href="index.html#quote">Get a quote<span class="shine"></span></a>
  </nav>
 </div>
</header>
<main id="main">
'''

def footer():
    return f'''</main>
<footer class="site-footer">
 <div class="container footer-grid">
  <div class="footer-about">
   <a class="brand" href="index.html"><img src="assets/om-mark.png" alt="" width="52" height="36"><span class="brand-copy"><strong>OM Ltd</strong><small>Quality Water Solutions</small></span></a>
   <p>Flowing solutions for every project — water systems, irrigation, workwear and branded merchandise for homes, farms and businesses across Kenya.</p>
   <div class="socials">
    <a href="https://x.com/OMlimiteds" target="_blank" rel="noopener" aria-label="OM Ltd on X">{I["x-social"]}</a>
    <a href="https://instagram.com/om.limiteds" target="_blank" rel="noopener" aria-label="OM Ltd on Instagram">{I["instagram"]}</a>
    <a href="https://www.tiktok.com/@om.limited" target="_blank" rel="noopener" aria-label="OM Ltd on TikTok">{I["tiktok"]}</a>
    <a href="https://www.facebook.com/search/pages/?q=OM%20Limited" target="_blank" rel="noopener" aria-label="OM Ltd on Facebook">{I["facebook"]}</a>
   </div>
  </div>
  <div><h4>Solutions</h4><ul>
   <li><a href="index.html#services">Plumbing installation</a></li>
   <li><a href="index.html#services">Irrigation &amp; farm</a></li>
   <li><a href="index.html#services">Tanks &amp; drainage</a></li>
   <li><a href="merch.html#workwear">Workwear &amp; PPE</a></li>
   <li><a href="merch.html">Branded merchandise</a></li>
  </ul></div>
  <div><h4>Company</h4><ul>
   <li><a href="founders.html">Founders</a></li>
   <li><a href="testimonials.html">Reviews</a></li>
   <li><a href="#" data-mo-open>Ask Mo AI</a></li>
   <li><a href="newsletter.html">Newsletter</a></li>
   <li><a href="mailto:oandmlimited@gmail.com">oandmlimited@gmail.com</a></li>
   <li><a href="https://wa.me/254714995749" target="_blank" rel="noopener">+254 714 995 749</a></li>
  </ul></div>
  <div class="newsletter"><h4>Stay in the flow</h4>
   <p>Product drops, farm-season offers and new merch — straight to your inbox. <a href="newsletter.html" class="text-link" style="font-size:.85rem">Preferences</a></p>
   <form class="news-form" id="newsForm" novalidate>
    <label class="sr-only" for="newsEmail">Email address</label>
    <input id="newsEmail" name="email" type="email" placeholder="you@example.com" autocomplete="email" required>
    <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
    <button class="btn btn-lime btn-sm" type="submit">Subscribe</button>
   </form>
   <p class="news-status" id="newsStatus" role="status" aria-live="polite"></p>
  </div>
 </div>
 <div class="container footer-bottom">
  <span>© <span data-year></span> OM Ltd · Build · Flow · Thrive</span>
  <nav aria-label="Footer"><a href="index.html#quote">Request a quote</a><a href="merch.html">Shop</a><a href="admin.html">Team login</a><span class="fb-status" id="fbStatus" title="Firebase connection"><i></i><span>Offline mode</span></span></nav>
 </div>
</footer>

<a class="whatsapp-float" href="https://wa.me/254714995749?text=Hello%20OM%20Ltd%2C%20I%20would%20like%20to%20make%20an%20enquiry." target="_blank" rel="noopener" aria-label="Chat with OM Ltd on WhatsApp" data-track="whatsapp_click">{I["whatsapp"]}</a>
<button class="to-top" aria-label="Back to top"><svg viewBox="0 0 44 44" style="position:absolute;inset:0;width:44px;height:44px;transform:rotate(-90deg)"><circle class="ring" cx="22" cy="22" r="20" fill="none" stroke="#2ad1ff" stroke-width="2" stroke-dasharray="125.7" stroke-dashoffset="125.7"/></svg>{I["up"]}</button>

<!-- Mo AI -->
<button class="mo-launcher" data-mo-open aria-label="Chat with Mo AI, OM's robot assistant">{bot("launch", "mo-bot", False, "")}<span class="badge">AI</span></button>
<div class="mo-launcher-tip" data-mo-open>👋 Hi! I'm <b>Mo</b>. Need help choosing?</div>
<section class="mo-panel" id="moPanel" role="dialog" aria-modal="false" aria-labelledby="moTitle">
 <div class="mo-head">
  <div class="avatar-bot">{bot("panel", "mo-bot", False, "")}</div>
  <div><b id="moTitle">Mo AI <span class="ai-pill">ROBOT</span></b><small><i></i><span id="moMode">Online · OM assistant</span></small></div>
  <button class="icon-btn" id="moReset" aria-label="Start a new chat" title="New chat">{I["refresh"]}</button>
  <button class="icon-btn" id="moClose" aria-label="Close Mo AI">{I["x"]}</button>
 </div>
 <div class="mo-body" id="moBody" aria-live="polite"></div>
 <div class="mo-suggest" id="moSuggest"></div>
 <form class="mo-input" id="moForm">
  <label class="sr-only" for="moText">Message Mo AI</label>
  <textarea id="moText" rows="1" placeholder="Ask about pipes, irrigation, workwear…" maxlength="800"></textarea>
  <button class="mo-send" type="submit" aria-label="Send">{I["send"]}</button>
 </form>
 <p class="mo-foot">Mo can make mistakes. Prices &amp; stock are confirmed by the OM team.</p>
</section>

<div class="lightbox" id="lightbox" aria-hidden="true"><button class="icon-btn" aria-label="Close image">{I["x"]}</button><img alt=""></div>
<div class="toast-wrap" id="toasts" aria-live="polite"></div>
<script type="module" src="js/app.js?v={VERSION}"></script>
</body>
</html>
'''

def services_select(id_="serviceSelect"):
    opts = ["Plumbing installation solutions", "Irrigation and farm supplies", "Greenhouse, tanks and drainage",
            "Workwear and safety equipment", "Branded merchandise", "Multiple services / Other enquiry"]
    return f'<select name="service" id="{id_}" required><option value="">Select a service</option>' + "".join(f"<option>{o}</option>" for o in opts) + "</select>"

# ------------------------------------------------------------------ pages
def index():
    svc = [
      ("wrench", "Plumbing installation", "Reliable installations for homes, businesses and new builds.",
       ["Sinks, taps and faucets", "Toilets and bathroom fittings", "Pipework, drainage and water heaters"], "Plumbing installation solutions", "assets/products/flow-tap.webp", True),
      ("sprout", "Irrigation &amp; farm supplies", "Water-smart systems for productive, efficient farms.",
       ["Drip and sprinkler systems", "Pumps, pipes and fittings", "Controllers, hoses and farm inputs"], "Irrigation and farm supplies", "assets/products/ir-sprinkler.webp", True),
      ("tank", "Greenhouses, tanks &amp; drainage", "Storage and drainage for farms, greenhouses and properties.",
       ["Greenhouse structures and accessories", "Water storage and drainage tanks", "Drainage pipes, channels and fittings"], "Greenhouse, tanks and drainage", None, False),
      ("helmet", "Workwear &amp; safety", "Protective, branded kit that keeps your crew safe and seen.",
       ["Coveralls, jackets and polos", "Reflective vests and safety boots", "Hard hats, gloves and eyewear"], "Workwear and safety equipment", None, False),
      ("gift", "Branded merchandise", "Backpacks, notebooks and more — carrying the OM mark.",
       ["OM smart backpacks (6 colours)", "Premium OM notebooks", "Custom logo items for your team"], "Branded merchandise", None, False),
    ]
    cards = []
    for n, (ic, t, p, li, s, img, wide) in enumerate(svc):
        media = f'<div class="svc-media"><img src="{img}" alt="" loading="lazy"></div>' if img else ""
        cards.append(f'''<article class="svc glass glass-hover reveal{' wide' if wide else ''}" data-tilt style="--d:{n*0.07:.2f}s">{media}
  <div class="svc-icon">{I[ic]}</div><h3>{t}</h3><p>{p}</p>
  <ul>{''.join(f"<li>{x}</li>" for x in li)}</ul>
  <a href="#quote" class="text-link service-quote" data-service="{s}">Request this service</a></article>''')
    cards.append(f'''<article class="svc svc-cta glass glass-hover reveal" style="--d:.35s"><div class="svc-icon">{I["spark"]}</div><div class="svc-cta-copy"><h3>Not sure what you need?</h3><p>Describe your project to Mo AI and get pointed to the right solution in seconds.</p></div><div class="hero-actions"><button class="btn btn-lime" data-mo-open>Ask Mo AI{I["arrow"]}</button></div></article>''')

    marquee_items = [("home", "Homes"), ("sprout", "Farms"), ("building", "Businesses"), ("factory", "Industry"), ("helmet", "Worksites"), ("drop", "Water systems"), ("leaf", "Greenhouses"), ("gift", "Corporate gifting")]
    mq = "".join(f'<span class="marquee-item">{I[i]}{t}</span>' for i, t in marquee_items) * 2

    return head("OM Ltd | Flowing Solutions for Every Project",
                "OM Ltd delivers plumbing installation, irrigation and farm supplies, tanks and drainage, workwear and branded merchandise across Kenya. Ask Mo AI or request a quotation.", "home") + f'''
<section class="hero">
 <div class="container hero-grid">
  <div>
   <span class="eyebrow"><span class="dot"></span>Quality water solutions · Kenya</span>
   <h1><span class="line"><span>Flowing solutions</span></span><span class="line"><span>for <span class="gradient-text">every project.</span></span></span></h1>
   <p class="hero-lead">Plumbing, irrigation, tanks, workwear and branded gear — one trusted partner for homes, farms and businesses. Built to last. Built to flow.</p>
   <div class="hero-actions">
    <a class="btn btn-primary" href="#quote" data-track="hero_quote">Request a quotation{I["arrow"]}<span class="shine"></span></a>
    <button class="btn btn-glass" data-mo-open data-track="hero_mo">{bot("btn", "mo-bot mini-bot", False, "")}Talk to Mo AI</button>
   </div>
   <div class="chips" role="group" aria-label="Quick service picker">
    <span class="chips-label">What do you need?</span>
    <a class="chip service-quote" href="#quote" data-service="Plumbing installation solutions">💧 Plumbing</a>
    <a class="chip service-quote" href="#quote" data-service="Irrigation and farm supplies">🌱 Irrigation</a>
    <a class="chip service-quote" href="#quote" data-service="Greenhouse, tanks and drainage">🛢️ Tanks &amp; drainage</a>
    <a class="chip service-quote" href="#quote" data-service="Workwear and safety equipment">🦺 Workwear</a>
    <a class="chip" href="merch.html">🎒 Merch</a>
   </div>
  </div>
  <div class="hero-stage" aria-label="Mo AI, OM's robot assistant">
   <div class="hero-glow"></div>
   <div class="hero-ring r1"><span class="sat"></span></div>
   <div class="hero-ring r2"><span class="sat"></span></div>
   <div data-mo-open class="hero-bot-wrap">{bot("hero", "mo-bot hero-bot")}</div>
   <div class="speech glass" id="heroSpeech">Hi, I'm <strong>Mo</strong> — OM's robot assistant. <span id="heroType"></span><span class="typing-caret"></span></div>
   <div class="float-card glass fc1"><span class="fi">{I["shield"]}</span><div><b>Quality guaranteed</b><small>Durable, leak-proof parts</small></div></div>
   <div class="float-card glass fc2"><span class="fi">{I["bolt"]}</span><div><b>Fast quotations</b><small>Online, email or WhatsApp</small></div></div>
  </div>
 </div>
</section>

<div class="marquee" aria-label="Who we serve"><div class="marquee-track">{mq}</div></div>

<section class="section-tight">
 <div class="container stats">
  <div class="stat glass reveal"><b><span data-count="5">0</span></b><span>Solution lines in one place</span></div>
  <div class="stat glass reveal" style="--d:.08s"><b><span data-count="4">0</span></b><span>Sectors served</span></div>
  <div class="stat glass reveal" style="--d:.16s"><b><span data-count="24">0</span>/7</b><span>Mo AI is always on</span></div>
  <div class="stat glass reveal" style="--d:.24s"><b><span data-count="3">0</span> steps</b><span>From enquiry to quote</span></div>
 </div>
</section>

<section class="section" id="services">
 <div class="container">
  <div class="section-head reveal"><span class="eyebrow"><span class="dot"></span>What we do</span><h2>Everything you need, <span class="gradient-text">in one flow.</span></h2><p>Pick a service to drop it straight into your quotation request.</p></div>
  <div class="bento">{''.join(cards)}</div>
 </div>
</section>

<section class="section-tight">
 <div class="container">
  <div class="section-head center reveal"><span class="eyebrow"><span class="dot"></span>Versatile applications</span><h2>One partner. <span class="gradient-text">Many projects.</span></h2></div>
  <div class="sectors">
   <div class="sector glass glass-hover reveal">{I["home"]}<span class="num">01</span><h3>Residential</h3><p>Bathrooms, kitchens, water heaters and home storage.</p></div>
   <div class="sector glass glass-hover reveal" style="--d:.08s">{I["building"]}<span class="num">02</span><h3>Commercial</h3><p>Offices, shops and hospitality — fitted to spec.</p></div>
   <div class="sector glass glass-hover reveal" style="--d:.16s">{I["factory"]}<span class="num">03</span><h3>Industrial</h3><p>Pipework, drainage and PPE for demanding sites.</p></div>
   <div class="sector glass glass-hover reveal" style="--d:.24s">{I["field"]}<span class="num">04</span><h3>Agricultural</h3><p>Drip, sprinklers, pumps and greenhouse supplies.</p></div>
  </div>
 </div>
</section>

<section class="section" id="showcase">
 <div class="container">
  <div class="section-head reveal"><span class="eyebrow"><span class="dot"></span>The OM collection</span><h2>Products that carry <span class="gradient-text">the OM mark.</span></h2><p>From the farm to the office — tap any poster to see it full size, or visit the shop.</p></div>
  <div class="showcase">
   <figure class="poster big glass glass-hover reveal" data-lightbox><img src="assets/poster-irrigation.webp" alt="OM irrigation and farm solutions: drip, sprinklers, pipes, pumps, controllers, hoses and farm inputs" loading="lazy"><figcaption>🌱 Irrigation &amp; farm</figcaption></figure>
   <figure class="poster tall glass glass-hover reveal" data-lightbox style="--d:.08s"><img src="assets/poster-flow.webp" alt="OM flowing solutions: premium pipes and fittings" loading="lazy"><figcaption>💧 Pipes &amp; fittings</figcaption></figure>
   <figure class="poster big glass glass-hover reveal" data-lightbox><img src="assets/poster-workwear.webp" alt="OM overall wear and safety: coveralls, vests, polos, jackets, boots and PPE" loading="lazy"><figcaption>🦺 Workwear &amp; safety</figcaption></figure>
   <figure class="poster glass glass-hover reveal" data-lightbox><img src="assets/poster-backpack.webp" alt="OM smart backpack in six colourways" loading="lazy"><figcaption>🎒 OM Backpack</figcaption></figure>
   <figure class="poster glass glass-hover reveal" data-lightbox style="--d:.08s"><img src="assets/poster-notebook.webp" alt="OM premium notebook in five colours" loading="lazy"><figcaption>📓 OM Notebook</figcaption></figure>
   <a href="merch.html" class="poster glass glass-hover reveal shop-tile" style="--d:.16s;display:flex;flex-direction:column;justify-content:center;padding:2rem;cursor:pointer"><div class="svc-icon">{I["gift"]}</div><h3 style="font-size:1.5rem;margin-bottom:.5rem">Visit the OM shop</h3><p class="muted">Pick colours, build an enquiry list and get one combined quote.</p><span class="text-link" style="margin-top:1.2rem">Shop the collection</span></a>
  </div>
 </div>
</section>

<section class="section" id="process">
 <div class="container">
  <div class="section-head center reveal"><span class="eyebrow"><span class="dot"></span>How it works</span><h2>Enquiry to quotation <span class="gradient-text">in 3 steps.</span></h2></div>
  <div class="process">
   <div class="step glass glass-hover reveal"><div class="step-no">1</div><h3>Tell us what you need</h3><p>Pick a service, ask Mo AI, or attach a photo or drawing.</p></div>
   <div class="step glass glass-hover reveal" style="--d:.1s"><div class="step-no">2</div><h3>Send your request</h3><p>It lands securely with the OM team — no email app needed.</p></div>
   <div class="step glass glass-hover reveal" style="--d:.2s"><div class="step-no">3</div><h3>Get your quotation</h3><p>We follow up by phone, email or WhatsApp with a tailored quote.</p></div>
  </div>
 </div>
</section>

<section class="section" id="mo-ai">
 <div class="container">
  <div class="mo-feature glass reveal">
   <div class="bot-wrap"><div class="hero-glow"></div><div class="hero-ring r1"><span class="sat"></span></div>{bot("feat", "mo-bot")}</div>
   <div>
    <span class="eyebrow"><span class="dot"></span>Meet Mo AI · our robot</span>
    <h2>Your 24/7 <span class="gradient-text">project assistant.</span></h2>
    <p class="muted">Mo knows OM's full range. Describe your farm, bathroom or worksite and Mo will suggest the right products, explain options and start your quotation — in English or Kiswahili.</p>
    <div class="mo-points">
     <div class="mo-point">{I["target"]}<div><b>Smart recommendations</b><small>Drip vs sprinkler? PVC vs HDPE? Mo explains the trade-offs.</small></div></div>
     <div class="mo-point">{I["bolt"]}<div><b>Instant quote starter</b><small>Mo fills in the quotation form for you, ready to send.</small></div></div>
     <div class="mo-point">{I["globe"]}<div><b>Speaks your language</b><small>Habari! Mo replies in English or Kiswahili.</small></div></div>
    </div>
    <div class="hero-actions" style="margin-top:0">
     <button class="btn btn-primary" data-mo-open data-mo-ask="I want to irrigate a 1 acre farm. What do you recommend?">Try: "Irrigate 1 acre"{I["arrow"]}<span class="shine"></span></button>
     <button class="btn btn-glass" data-mo-open data-mo-ask="What safety kit does a 10-person construction crew need?">Try: "Kit for my crew"</button>
    </div>
   </div>
  </div>
 </div>
</section>


<section class="section-tight" id="newsletter">
 <div class="container">
  <div class="mo-feature glass reveal" style="grid-template-columns:1.1fr .9fr">
   <div>
    <span class="eyebrow"><span class="dot"></span>The OM Newsletter</span>
    <h2>Stay in <span class="gradient-text">the flow.</span></h2>
    <p class="muted">Farm-season tips, new merch drops (hello, Cyber Lime 🎒), safety reminders and members-only offers. One useful email at a time — unsubscribe anytime.</p>
    <div class="mo-points" style="margin-bottom:0">
     <div class="mo-point">{I["sprout"]}<div><b>Farm &amp; irrigation tips</b><small>Seasonal watering guides and kit checklists.</small></div></div>
     <div class="mo-point">{I["gift"]}<div><b>First look at merch drops</b><small>New colours and limited editions before anyone else.</small></div></div>
    </div>
   </div>
   <form class="form-card" data-newsletter novalidate style="padding:0">
    <label class="field">First name<input name="fname" autocomplete="given-name" maxlength="60" placeholder="Optional"></label>
    <label class="field">Email address *<input name="email" type="email" autocomplete="email" required maxlength="254" placeholder="you@example.com"></label>
    <fieldset style="border:0;padding:0;margin:0 0 1rem"><legend class="field" style="margin-bottom:.5rem">I'm interested in</legend>
     <div class="chips" style="margin:0">
      <label class="chip"><input type="checkbox" name="interests" value="farm" class="sr-only" checked>🌱 Farm &amp; irrigation</label>
      <label class="chip"><input type="checkbox" name="interests" value="plumbing" class="sr-only">💧 Plumbing</label>
      <label class="chip"><input type="checkbox" name="interests" value="safety" class="sr-only">🦺 Safety &amp; workwear</label>
      <label class="chip"><input type="checkbox" name="interests" value="merch" class="sr-only" checked>🎒 Merch drops</label>
     </div>
    </fieldset>
    <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
    <button class="btn btn-lime btn-block" type="submit">Subscribe to the newsletter{I["mail"]}</button>
    <p class="news-status form-status" role="status" aria-live="polite">No spam. <a class="text-link" href="newsletter.html#unsubscribe" style="font-size:.85rem">Unsubscribe anytime</a></p>
   </form>
  </div>
 </div>
</section>

<section class="section" id="quote">
 <div class="container quote-grid">
  <div class="quote-intro reveal">
   <span class="eyebrow"><span class="dot"></span>Request a quotation</span>
   <h2>Let's get your project <span class="gradient-text">flowing.</span></h2>
   <p class="muted">The more detail you share, the faster we can price it. Attach photos, plans or a shopping list if you have them. No obligation.</p>
   <div class="contact-cards">
    <div class="contact-card glass glass-hover"><span class="ci">{I["mail"]}</span><div><small>Email our team</small><a href="mailto:oandmlimited@gmail.com">oandmlimited@gmail.com</a></div></div>
    <div class="contact-card glass glass-hover"><span class="ci">{I["whatsapp"]}</span><div><small>Chat on WhatsApp</small><a href="https://wa.me/254714995749" target="_blank" rel="noopener" data-track="whatsapp_click">+254 714 995 749</a></div></div>
    <div class="contact-card glass glass-hover"><span class="ci">{I["clock"]}</span><div><small>Always-on help</small><a href="#" data-mo-open>Ask Mo AI anytime →</a></div></div>
   </div>
  </div>
  <div class="form-card glass reveal" style="--d:.1s">
   <form id="quoteForm" novalidate>
    <div class="form-head"><h3>How can we help?</h3><small>* required</small></div>
    <div class="form-row">
     <label class="field">Full name *<input name="name" type="text" placeholder="Your name" autocomplete="name" required maxlength="120"></label>
     <label class="field">Company<input name="company" type="text" placeholder="Optional" autocomplete="organization" maxlength="120"></label>
    </div>
    <div class="form-row">
     <label class="field">Email *<input name="email" type="email" placeholder="you@example.com" autocomplete="email" required maxlength="254"></label>
     <label class="field">Phone *<input name="phone" type="tel" placeholder="e.g. 0712 345 678" autocomplete="tel" required maxlength="40"></label>
    </div>
    <label class="field">Service required *{services_select()}</label>
    <div class="form-row">
     <label class="field">Project location<input name="location" type="text" placeholder="Town / area" maxlength="120"></label>
     <label class="field">Estimated budget<select name="budget"><option value="">Select if known</option><option>Not yet decided</option><option>Below KSh 50,000</option><option>KSh 50,000 – 200,000</option><option>KSh 200,000 – 500,000</option><option>Above KSh 500,000</option></select></label>
    </div>
    <label class="field">Your requirements *<textarea name="details" rows="4" placeholder="Quantities, sizes, colours, site details…" required maxlength="5000"></textarea></label>
    <label class="dropzone" id="dropzone">{I["upload"]}<div><b>Attach photos or plans <span class="muted" style="font-weight:400">(optional)</span></b><small>Up to 3 files · JPG, PNG, WEBP or PDF · max 8 MB each</small></div><input type="file" id="files" accept="image/jpeg,image/png,image/webp,application/pdf" multiple></label>
    <div class="file-list" id="fileList"></div>
    <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
    <label class="consent"><input type="checkbox" name="consent" required><span>I agree that OM Ltd may contact me about this request.</span></label>
    <button class="btn btn-primary btn-block" type="submit"><span class="spinner"></span><span class="submit-label">Send quotation request</span>{I["send"]}<span class="shine"></span></button>
    <div class="progress" id="uploadProgress"><span></span></div>
    <p class="form-status" id="formStatus" role="status" aria-live="polite">Your details are only used to respond to your enquiry.</p>
   </form>
   <div class="success-panel" id="quoteSuccess">
    <div class="check">{I["check"]}</div>
    <h3>Request received!</h3>
    <p>Thank you — the OM team will be in touch soon.<br>Your reference: <span class="ref-code" id="refCode">—</span></p>
    <div class="hero-actions" style="justify-content:center;margin:0"><button class="btn btn-glass" id="newQuote">Send another</button><a class="btn btn-lime" href="https://wa.me/254714995749" target="_blank" rel="noopener">Follow up on WhatsApp</a></div>
   </div>
  </div>
 </div>
</section>
''' + footer()


def merch():
    bp_colors = [("black", "Stealth Black", "#15171c"), ("blue", "Midnight Blue", "#1d3a7a"), ("green", "Forest Green", "#2f5a35"),
                 ("grey", "Graphite Grey", "#5b6170"), ("white", "Arctic White", "#e9edf3"), ("lime", "Cyber Lime", "#c8f43c")]
    nb_colors = [("black", "Midnight Black", "#14161b"), ("green", "Forest Green", "#2a4a33"), ("blue", "Ocean Blue", "#1b3466"),
                 ("grey", "Stone Grey", "#4b505c"), ("white", "Arctic White", "#eef1f6")]

    def swatches(prefix, cols, limited=None):
        out = []
        for i, (k, name, c) in enumerate(cols):
            lim = ' data-limited="1"' if k == limited else ''
            out.append(f'<button class="swatch" style="--c:{c}" data-img="assets/products/{prefix}-{k}.webp" data-name="{name}"{lim} aria-pressed="{"true" if i == 0 else "false"}" aria-label="{name}"></button>')
        return "".join(out)

    def product(img, kind, name, desc, item):
        return f'''<article class="product glass glass-hover reveal"><div class="ph"><img src="assets/products/{img}.webp" alt="{name}" loading="lazy"></div>
<div class="pbody"><span class="kind">{kind}</span><h3>{name}</h3><p>{desc}</p>
<div class="pactions"><a class="text-link service-quote" href="index.html#quote" data-service="{'Workwear and safety equipment' if kind.startswith('Work') or kind.startswith('PPE') else 'Irrigation and farm supplies' if kind.startswith('Farm') else 'Branded merchandise'}">Quote</a>
<button class="add-btn" data-add="{item}" aria-label="Add {name} to enquiry list">{I["plus"]}</button></div></div></article>'''

    ww = [("ww-coveralls", "Workwear", "OM Coveralls", "Reflective-taped, full-body protection for site crews."),
          ("ww-vests", "Workwear", "Hi-vis safety vests", "Bright, reflective and comfortable all day."),
          ("ww-polos", "Workwear", "Branded polo shirts", "Navy and grey team polos with the OM mark."),
          ("ww-jackets", "Workwear", "Hi-vis jackets", "Two-tone reflective jackets for cold mornings."),
          ("ww-boots", "PPE", "Safety boots", "Steel-toe protection with slip-resistant soles."),
          ("ww-ppe", "PPE", "PPE accessories", "Hard hats, safety glasses and work gloves.")]
    ir = [("ir-drip", "Farm", "Drip irrigation kits", "Deliver water straight to the root — less waste."),
          ("ir-sprinkler", "Farm", "Sprinkler systems", "Even coverage for vegetables, lawns and fields."),
          ("ir-pipes", "Farm", "Water pipes &amp; fittings", "HDPE and PVC pipes with matching fittings."),
          ("ir-pumps", "Farm", "Water pumps", "Surface pumps for boreholes, tanks and rivers."),
          ("ir-controllers", "Farm", "Irrigation controllers", "Automate watering times, save water and labour."),
          ("ir-hoses", "Farm", "Garden hoses &amp; accessories", "Durable hoses, reels and nozzles."),
          ("ir-inputs", "Farm", "Fertilizers &amp; farm inputs", "Quality inputs to boost your crop yield.")]

    return head("Shop & Merch | OM Ltd", "OM smart backpacks, premium notebooks, branded workwear, PPE and irrigation gear. Pick a colour and request a quote.", "merch") + f'''
<section class="page-hero">
 <div class="container">
  <span class="eyebrow"><span class="dot"></span>The OM collection</span>
  <h1>Carry ideas. <span class="gradient-text">Connect possibilities.</span></h1>
  <p>Smart branded gear for professionals, creators and crews — plus the workwear and farm kit OM is known for. Add items to your enquiry list and get one combined quotation.</p>
 </div>
</section>

<section class="section-tight" style="padding-top:0">
 <div class="container">
  <div class="tabs-wrap"><div class="tabs glass" role="tablist" aria-label="Product categories">
   <button class="tab" role="tab" aria-selected="true" aria-controls="p-gear" id="t-gear" data-hash="gear">🎒 Signature gear</button>
   <button class="tab" role="tab" aria-selected="false" aria-controls="p-workwear" id="t-workwear" data-hash="workwear">🦺 Workwear &amp; PPE</button>
   <button class="tab" role="tab" aria-selected="false" aria-controls="p-farm" id="t-farm" data-hash="farm">🌱 Farm &amp; irrigation</button>
  </div></div>

  <div class="panel" id="p-gear" role="tabpanel" aria-labelledby="t-gear">
   <article class="product-hero glass reveal" data-product="OM Smart Backpack">
    <div class="product-stage"><div class="pedestal"></div><img src="assets/products/backpack-hero.webp" alt="OM Smart Backpack" data-main></div>
    <div class="product-info">
     <span class="tag">Signature merch · New</span>
     <h2>OM Smart Backpack</h2>
     <p>Designed for modern professionals and creators. Smart, durable and functional — built to move with you from the commute to the field.</p>
     <div class="feature-chips"><span>💻 Fits 15.6" laptops</span><span>🔌 USB charging port</span><span>💧 Water resistant</span><span>🔒 Anti-theft pocket</span><span>🧳 Luggage strap</span><span>🌬️ Breathable back</span></div>
     <div class="swatch-label">Colour: <b data-colour-name>Stealth Black</b></div>
     <div class="swatches" role="group" aria-label="Backpack colour">{swatches("backpack", bp_colors, "lime")}</div>
     <dl class="spec-list"><div><dt>Material</dt><dd>Premium polyester</dd></div><div><dt>Capacity</dt><dd>20–35 L</dd></div><div><dt>Dimensions</dt><dd>45 × 32 × 18 cm</dd></div><div><dt>Weight</dt><dd>1.0 kg</dd></div><div><dt>Packaging</dt><dd>Eco gift box</dd></div><div><dt>Warranty</dt><dd>1 year limited</dd></div></dl>
     <div class="hero-actions" style="margin-top:0"><button class="btn btn-primary" data-add-hero>Add to enquiry{I["plus"]}<span class="shine"></span></button><button class="btn btn-glass" data-lightbox-src="assets/poster-backpack.webp">View full poster</button></div>
    </div>
   </article>

   <article class="product-hero glass reveal" data-product="OM Premium Notebook">
    <div class="product-info">
     <span class="tag">Signature merch · Gift-ready</span>
     <h2>OM Premium Notebook</h2>
     <p>Ideas. Planned. Connected. A PU-leather A5 notebook that keeps your plans on track — with an embossed OM logo, elastic closure and pen loop.</p>
     <div class="feature-chips"><span>📖 192 lined pages</span><span>📄 100 GSM ivory paper</span><span>📐 Lay-flat binding</span><span>🔖 Ribbon bookmark</span><span>🗂️ Expandable pocket</span><span>🖊️ Pen loop</span></div>
     <div class="swatch-label">Colour: <b data-colour-name>Midnight Black</b></div>
     <div class="swatches" role="group" aria-label="Notebook colour">{swatches("notebook", nb_colors)}</div>
     <dl class="spec-list"><div><dt>Cover</dt><dd>Premium PU leather</dd></div><div><dt>Size</dt><dd>A5 (14.5 × 21 cm)</dd></div><div><dt>Pages</dt><dd>192 lined</dd></div><div><dt>Closure</dt><dd>Elastic band</dd></div></dl>
     <div class="hero-actions" style="margin-top:0"><button class="btn btn-primary" data-add-hero>Add to enquiry{I["plus"]}<span class="shine"></span></button><button class="btn btn-glass" data-lightbox-src="assets/poster-notebook.webp">View full poster</button></div>
    </div>
    <div class="product-stage"><div class="pedestal"></div><img src="assets/products/notebook-hero.webp" alt="OM Premium Notebook" data-main></div>
   </article>

   <div class="cta-band glass reveal" style="margin-top:1.4rem"><h2>Your logo, <span class="gradient-text">our craft.</span></h2><p>Need backpacks, notebooks or polos branded for your team, school or event? Tell us the quantity and deadline.</p><div class="hero-actions"><a class="btn btn-lime service-quote" data-service="Branded merchandise" href="index.html#quote">Get a corporate quote{I["arrow"]}</a><button class="btn btn-glass" data-mo-open data-mo-ask="I need branded merchandise for 50 staff. What can OM make?">Ask Mo for ideas</button></div></div>
  </div>

  <div class="panel" id="p-workwear" role="tabpanel" aria-labelledby="t-workwear" hidden>
   <div class="section-head center"><h2>Work smart. <span class="gradient-text">Stay safe.</span></h2><p>High-quality workwear and PPE for a safer, more productive workplace — branded with your logo or ours.</p></div>
   <div class="product-grid">{''.join(product(*p, p[2]) for p in ww)}</div>
  </div>

  <div class="panel" id="p-farm" role="tabpanel" aria-labelledby="t-farm" hidden>
   <div class="section-head center"><h2>Grow more. <span class="gradient-text">Worry less.</span></h2><p>Smart irrigation and quality farm supplies, with expert installation and support.</p></div>
   <div class="product-grid cols-4">{''.join(product(*p, p[2]) for p in ir)}</div>
  </div>
 </div>
</section>

<div class="tray" id="tray" role="region" aria-label="Enquiry list"><span class="tray-count" id="trayCount">0</span><span class="tray-text" id="trayText">items in your enquiry</span><button class="tray-clear" id="trayClear">Clear</button><a class="btn btn-lime btn-sm" href="index.html#quote" id="trayGo">Request quote{I["arrow"]}</a></div>
''' + footer()


def founders():
    people = [("JS", "John Senteu"), ("DM", "Dickson Monyatet"), ("IO", "Ian Ombui"), ("IO", "Isaiah Okara")]
    cards = "".join(f'''<article class="founder glass glass-hover reveal" data-tilt style="--d:{i*0.08:.2f}s"><div class="avatar">{ini}</div><span class="role">Co-founder</span><h2>{n}</h2><p>Founder, OM Ltd</p><small>Full biography coming soon.</small></article>''' for i, (ini, n) in enumerate(people))
    return head("Founders | OM Ltd", "Meet the founders of OM Ltd — John Senteu, Dickson Monyatet, Ian Ombui and Isaiah Okara.", "founders") + f'''
<section class="page-hero"><div class="container">
 <span class="eyebrow"><span class="dot"></span>The people behind OM</span>
 <h1>Meet our <span class="gradient-text">founders.</span></h1>
 <p>Four founders building practical water, farm and workplace solutions — and a brand that carries well beyond the job site.</p>
</div></section>
<section class="section-tight" style="padding-top:0"><div class="container"><div class="founder-grid">{cards}</div></div></section>
<section class="section"><div class="container">
 <div class="section-head center reveal"><span class="eyebrow"><span class="dot"></span>What drives us</span><h2>Build · Flow · <span class="gradient-text">Thrive.</span></h2></div>
 <div class="values">
  <div class="value glass glass-hover reveal">{I["shield"]}<h3>Quality guaranteed</h3><p>Durable, high-performance products chosen for long-term use.</p></div>
  <div class="value glass glass-hover reveal" style="--d:.08s">{I["users"]}<h3>Trusted partner</h3><p>One point of contact from first enquiry to delivery and support.</p></div>
  <div class="value glass glass-hover reveal" style="--d:.16s">{I["leaf"]}<h3>Smart &amp; sustainable</h3><p>Water-saving systems and eco-friendly packaging, built for a better tomorrow.</p></div>
 </div>
 <div class="cta-band glass reveal" style="margin-top:2rem"><h2>Building solutions <span class="gradient-text">with purpose.</span></h2><p>Connect with OM Ltd to discuss your project or a partnership.</p><div class="hero-actions"><a class="btn btn-primary" href="index.html#quote">Contact OM Ltd{I["arrow"]}<span class="shine"></span></a><a class="btn btn-glass" href="https://wa.me/254714995749" target="_blank" rel="noopener">WhatsApp us</a></div></div>
</div></section>
''' + footer()


def testimonials():
    return head("Reviews | OM Ltd", "Verified customer feedback for OM Ltd — and a place to share your own experience.", "testimonials") + f'''
<section class="page-hero"><div class="container">
 <span class="eyebrow"><span class="dot"></span>Customer feedback</span>
 <h1>Experiences that <span class="gradient-text">matter.</span></h1>
 <p>Every review here is from a real OM customer and is published only with their permission.</p>
</div></section>
<section class="section-tight" style="padding-top:0"><div class="container">
 <div class="reviews" id="reviews" aria-live="polite"></div>
 <div class="empty-state glass reveal" id="reviewsEmpty">
  <div class="qm">“</div>
  <h2>Be the first to share your OM experience.</h2>
  <p>Have we supplied a product or supported your project? Tell us what went well and what we can improve. Approved reviews appear here.</p>
  <a class="btn btn-glass" href="#share">Write a review</a>
 </div>
</div></section>
<section class="section" id="share"><div class="container quote-grid">
 <div class="quote-intro reveal"><span class="eyebrow"><span class="dot"></span>Share your story</span><h2>Your feedback, <span class="gradient-text">our progress.</span></h2><p class="muted">Reviews are checked by the OM team before they go live. We never invent or edit customer reviews.</p>
  <div class="contact-cards"><div class="contact-card glass glass-hover"><span class="ci">{I["whatsapp"]}</span><div><small>Prefer WhatsApp?</small><a href="https://wa.me/254714995749?text=Hello%20OM%20Ltd%2C%20I%20would%20like%20to%20share%20feedback%20about%20my%20experience." target="_blank" rel="noopener">Send feedback on WhatsApp</a></div></div></div>
 </div>
 <div class="form-card glass reveal" style="--d:.1s">
  <form id="reviewForm" novalidate>
   <div class="form-head"><h3>Write a review</h3><small>* required</small></div>
   <fieldset style="border:0;padding:0;margin:0"><legend class="field" style="margin-bottom:.3rem">Your rating *</legend>
    <div class="star-input">{''.join(f'<input type="radio" name="rating" id="r{n}" value="{n}"{" required" if n==5 else ""}><label for="r{n}" title="{n} stars">★</label>' for n in range(5,0,-1))}</div>
   </fieldset>
   <div class="form-row">
    <label class="field">Name to display *<input name="name" required maxlength="80" placeholder="e.g. Jane W."></label>
    <label class="field">Organisation / town<input name="org" maxlength="80" placeholder="Optional"></label>
   </div>
   <label class="field">Product or service<select name="service"><option value="">Select</option><option>Plumbing installation</option><option>Irrigation &amp; farm supplies</option><option>Tanks &amp; drainage</option><option>Workwear &amp; safety</option><option>Branded merchandise</option></select></label>
   <label class="field">Your review *<textarea name="message" required minlength="10" maxlength="1200" placeholder="What did OM do for you?"></textarea></label>
   <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
   <label class="consent"><input type="checkbox" name="consent" required><span>I give OM Ltd permission to publish this review with the name above.</span></label>
   <button class="btn btn-primary btn-block" type="submit"><span class="spinner"></span><span class="submit-label">Submit review</span>{I["send"]}<span class="shine"></span></button>
   <p class="form-status" id="reviewStatus" role="status" aria-live="polite"></p>
  </form>
 </div>
</div></section>
''' + footer()



def newsletter():
    return head("Newsletter | OM Ltd", "Join the OM Ltd newsletter for farm-season tips, merch drops and offers — or manage your subscription.", "newsletter") + f"""
<section class="page-hero"><div class="container">
 <span class="eyebrow"><span class="dot"></span>The OM Newsletter</span>
 <h1>Good things <span class="gradient-text">flow to your inbox.</span></h1>
 <p>Seasonal irrigation guides, new merch colours, safety checklists and subscriber-only offers from OM Ltd.</p>
</div></section>
<section class="section-tight" style="padding-top:0"><div class="container">
 <div class="values" style="margin-bottom:1.4rem">
  <div class="value glass glass-hover reveal">{I["sprout"]}<h3>Grow smarter</h3><p>When to water, what to plant and how to keep drip lines clean through the season.</p></div>
  <div class="value glass glass-hover reveal" style="--d:.08s">{I["gift"]}<h3>Merch drops first</h3><p>Early access to new backpack and notebook colours — including limited editions.</p></div>
  <div class="value glass glass-hover reveal" style="--d:.16s">{I["shield"]}<h3>Safety reminders</h3><p>PPE checklists and site-safety tips your crew will actually read.</p></div>
 </div>
 <div class="quote-grid">
  <div class="form-card glass reveal">
   <form data-newsletter novalidate>
    <div class="form-head"><h3>Subscribe</h3><small>* required</small></div>
    <div class="form-row">
     <label class="field">First name<input name="fname" autocomplete="given-name" maxlength="60" placeholder="Optional"></label>
     <label class="field">Email address *<input name="email" type="email" autocomplete="email" required maxlength="254" placeholder="you@example.com"></label>
    </div>
    <fieldset style="border:0;padding:0;margin:0 0 1rem"><legend class="field" style="margin-bottom:.5rem">Topics</legend>
     <div class="chips" style="margin:0">
      <label class="chip"><input type="checkbox" name="interests" value="farm" class="sr-only" checked>🌱 Farm &amp; irrigation</label>
      <label class="chip"><input type="checkbox" name="interests" value="plumbing" class="sr-only">💧 Plumbing</label>
      <label class="chip"><input type="checkbox" name="interests" value="safety" class="sr-only">🦺 Safety &amp; workwear</label>
      <label class="chip"><input type="checkbox" name="interests" value="merch" class="sr-only" checked>🎒 Merch drops</label>
     </div>
    </fieldset>
    <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
    <label class="consent"><input type="checkbox" name="consent" required><span>I'd like to receive emails from OM Ltd. I can unsubscribe at any time.</span></label>
    <button class="btn btn-primary btn-block" type="submit">Subscribe{I["mail"]}<span class="shine"></span></button>
    <p class="form-status" role="status" aria-live="polite"></p>
   </form>
  </div>
  <div class="form-card glass reveal" id="unsubscribe" style="--d:.1s">
   <form id="unsubForm" novalidate>
    <div class="form-head"><h3>Unsubscribe</h3><small>We'll remove you within 48 hours</small></div>
    <label class="field">Email address *<input name="email" type="email" autocomplete="email" required maxlength="254" placeholder="you@example.com"></label>
    <label class="field">Anything we could do better?<textarea name="reason" maxlength="300" rows="3" placeholder="Optional"></textarea></label>
    <button class="btn btn-glass btn-block" type="submit">Unsubscribe me</button>
    <p class="form-status" id="unsubStatus" role="status" aria-live="polite"></p>
   </form>
  </div>
 </div>
</div></section>
""" + footer()

def admin():
    return head("Team dashboard | OM Ltd", "OM Ltd team dashboard.", "admin").replace('<meta name="description"', '<meta name="robots" content="noindex,nofollow"><meta name="description"') + f'''
<section class="admin-shell"><div class="container">
 <div class="admin-login glass" id="adminLogin">
  {bot("admin", "mo-bot", True, "Mo AI")}
  <h1>OM team dashboard</h1>
  <p id="adminMsg">Sign in with your OM Google account to view quotation requests, subscribers and reviews.</p>
  <button class="btn btn-glass btn-block" id="googleSignIn">{I["google"]} Sign in with Google</button>
 </div>
 <div id="adminApp" hidden>
  <div class="admin-top"><div><span class="eyebrow"><span class="dot"></span>Live from Firestore</span><h1 style="margin-top:.6rem">Hello, <span class="gradient-text" id="adminName">team</span></h1></div><div class="hero-actions" style="margin:0"><button class="btn btn-glass btn-sm" id="exportCsv">Export quotes CSV</button><button class="btn btn-glass btn-sm" id="signOut">Sign out</button></div></div>
  <div class="kpis"><div class="kpi glass"><small>Total quotes</small><b id="kTotal">0</b></div><div class="kpi glass"><small>New</small><b id="kNew">0</b></div><div class="kpi glass"><small>Subscribers</small><b id="kSubs">0</b></div><div class="kpi glass"><small>Pending reviews</small><b id="kReviews">0</b></div></div>
  <div class="tabs-wrap" style="text-align:left"><div class="tabs glass" role="tablist">
   <button class="tab" role="tab" aria-selected="true" data-admin-tab="quotes">Quotations</button>
   <button class="tab" role="tab" aria-selected="false" data-admin-tab="reviews">Reviews</button>
   <button class="tab" role="tab" aria-selected="false" data-admin-tab="subs">Subscribers</button>
   <button class="tab" role="tab" aria-selected="false" data-admin-tab="compose">✉️ Compose newsletter</button>
  </div></div>
  <div class="table-card glass" data-admin-panel="quotes"><table class="data"><thead><tr><th>Date</th><th>Ref</th><th>Customer</th><th>Service</th><th>Details</th><th>Files</th><th>Status</th></tr></thead><tbody id="quotesBody"><tr><td colspan="7" class="muted">Loading…</td></tr></tbody></table></div>
  <div class="table-card glass" data-admin-panel="reviews" hidden><table class="data"><thead><tr><th>Date</th><th>Name</th><th>Rating</th><th>Review</th><th>Status</th><th></th></tr></thead><tbody id="reviewsBody"></tbody></table></div>
  <div class="table-card glass" data-admin-panel="subs" hidden><div class="admin-top" style="margin-bottom:.6rem"><small class="muted" id="subsNote">Unsubscribed emails are excluded automatically.</small><button class="btn btn-glass btn-sm" id="exportSubs">Export subscribers CSV</button></div><table class="data"><thead><tr><th>Date</th><th>Email</th><th>Name</th><th>Interests</th><th>Status</th></tr></thead><tbody id="subsBody"></tbody></table></div>
  <div class="form-card glass" data-admin-panel="compose" hidden>
   <div class="quote-grid" style="grid-template-columns:1fr 1fr">
    <form id="composeForm" novalidate>
     <div class="form-head"><h3>New newsletter</h3><small>Sent via the Firebase “Trigger Email” extension</small></div>
     <label class="field">Audience<select name="audience"><option value="all">All active subscribers</option><option value="farm">🌱 Farm &amp; irrigation</option><option value="plumbing">💧 Plumbing</option><option value="safety">🦺 Safety &amp; workwear</option><option value="merch">🎒 Merch drops</option></select></label>
     <label class="field">Subject *<input name="subject" required maxlength="140" placeholder="e.g. New Cyber Lime backpacks have landed 🎒"></label>
     <label class="field">Headline *<input name="headline" required maxlength="120" placeholder="Short, punchy headline"></label>
     <label class="field">Message *<textarea name="body" required rows="8" maxlength="6000" placeholder="Write your update. Blank lines become paragraphs."></textarea></label>
     <div class="form-row">
      <label class="field">Button text<input name="ctaText" maxlength="40" placeholder="Shop the drop"></label>
      <label class="field">Button link<input name="ctaUrl" type="url" maxlength="300" placeholder="https://…/merch.html"></label>
     </div>
     <div class="hero-actions" style="margin-top:.4rem"><button class="btn btn-glass" type="button" id="sendTest">Send test to me</button><button class="btn btn-primary" type="submit"><span class="spinner"></span><span class="submit-label">Send newsletter</span>{I["send"]}</button></div>
     <p class="form-status" id="composeStatus" role="status" aria-live="polite"></p>
    </form>
    <div><div class="form-head"><h3>Live preview</h3><small id="audienceCount">—</small></div><iframe id="nlPreview" title="Newsletter preview" style="width:100%;height:620px;border:0;border-radius:16px;background:#fff"></iframe></div>
   </div>
   <div class="table-card" style="padding:0;margin-top:1.4rem"><h3 style="font-size:1.1rem;margin-bottom:.6rem">Sent campaigns</h3><table class="data"><thead><tr><th>Date</th><th>Subject</th><th>Audience</th><th>Recipients</th><th>By</th></tr></thead><tbody id="campaignsBody"></tbody></table></div>
  </div>
 </div>
</div></section>
<script type="module" src="js/admin.js?v={VERSION}"></script>
''' + footer()


def notfound():
    return head("Page not found | OM Ltd", "This page doesn't exist.", "404") + f'''
<section class="page-hero" style="min-height:60vh;display:grid;place-items:center"><div class="container">
 <div style="width:200px;margin:0 auto">{bot("nf", "mo-bot hero-bot")}</div>
 <h1>4<span class="gradient-text">0</span>4 — this pipe leads nowhere.</h1>
 <p>Mo couldn't find that page. Let's get you flowing again.</p>
 <div class="hero-actions"><a class="btn btn-primary" href="index.html">Back home{I["arrow"]}<span class="shine"></span></a><button class="btn btn-glass" data-mo-open>Ask Mo AI</button></div>
</div></section>
''' + footer()


pages = {"index.html": index, "merch.html": merch, "founders.html": founders, "testimonials.html": testimonials, "admin.html": admin, "newsletter.html": newsletter, "404.html": notfound}
for name, fn in pages.items():
    (OUT / name).write_text(fn(), encoding="utf-8")
    print("wrote", name)
