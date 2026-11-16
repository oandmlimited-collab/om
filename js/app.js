// =============================================================
// OM Ltd — site interactions + Firebase-powered forms
// =============================================================
import { isConfigured, firestore, storage, track, remoteConfig } from "./firebase.js";
import { initChat } from "./om-ai.js";
import { initQuote } from "./quote.js";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const EMAIL = "oandmlimited@gmail.com";

// ---------------------------------------------------------------- toasts
export function toast(msg, ms = 3600) {
  const wrap = $("#toasts"); if (!wrap) return;
  const el = document.createElement("div"); el.className = "toast"; el.textContent = msg;
  wrap.appendChild(el); setTimeout(() => el.remove(), ms);
}

// ---------------------------------------------------------------- nav + header
const header = $(".site-header"), menu = $(".menu-toggle"), nav = $("#mainNav");
const setMenu = open => { nav?.classList.toggle("open", open); menu?.setAttribute("aria-expanded", String(open)); menu?.setAttribute("aria-label", open ? "Close navigation" : "Open navigation"); };
menu?.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
$$("a", nav).forEach(a => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", e => { if (e.key === "Escape") setMenu(false); });

const toTop = $(".to-top");
const onScroll = () => {
  const y = scrollY;
  header?.classList.toggle("scrolled", y > 10);
  toTop?.classList.toggle("on", y > 600);
};
onScroll(); addEventListener("scroll", onScroll, { passive: true });
toTop?.addEventListener("click", () => scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" }));
$$("[data-year]").forEach(el => el.textContent = new Date().getFullYear());

// ---------------------------------------------------------------- theme (white default · blue)
const themeBtn = $(".theme-toggle");
const applyTheme = t => {
  if (t === "blue") document.documentElement.dataset.theme = "blue"; else delete document.documentElement.dataset.theme;
  themeBtn?.setAttribute("aria-label", t === "blue" ? "Switch to white theme" : "Switch to blue theme");
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", t === "blue" ? "#061332" : "#f5f7fb");
};
applyTheme(document.documentElement.dataset.theme === "blue" ? "blue" : "white");
themeBtn?.addEventListener("click", () => {
  const t = document.documentElement.dataset.theme === "blue" ? "white" : "blue";
  applyTheme(t); try { localStorage.setItem("om-theme", t); } catch {}
  track("theme_change", { theme: t });
});

// reveal on scroll + counters
const io = "IntersectionObserver" in window ? new IntersectionObserver(entries => entries.forEach(en => {
  if (!en.isIntersecting) return;
  en.target.classList.add("in");
  $$("[data-count]", en.target).forEach(countUp);
  io.unobserve(en.target);
}), { threshold: .12, rootMargin: "0px 0px -40px 0px" }) : null;
$$(".reveal").forEach(el => io ? io.observe(el) : el.classList.add("in"));
document.documentElement.classList.add("js-ready"); // only now may content start hidden-for-animation
// failsafe: anything already on screen (or above it) shows immediately
requestAnimationFrame(() => $$(".reveal").forEach(el => { if (el.getBoundingClientRect().top < innerHeight) el.classList.add("in"); }));
function countUp(el) {
  const to = +el.dataset.count; if (reduced) { el.textContent = to; return; }
  const t0 = performance.now(), d = 1400;
  const step = t => { const p = Math.min(1, (t - t0) / d); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}

// lightbox
const lb = $("#lightbox");
const openLb = (src, alt = "") => { if (!lb) return; $("img", lb).src = src; $("img", lb).alt = alt; lb.classList.add("on"); lb.setAttribute("aria-hidden", "false"); $("button", lb).focus(); track("view_poster", { src }); };
const closeLb = () => { lb?.classList.remove("on"); lb?.setAttribute("aria-hidden", "true"); };
$$("[data-lightbox]").forEach(f => { f.tabIndex = 0; f.setAttribute("role", "button"); const i = $("img", f); const go = () => openLb(i.src, i.alt); f.addEventListener("click", go); f.addEventListener("keydown", e => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), go())); });
$$("[data-lightbox-src]").forEach(b => b.addEventListener("click", () => openLb(b.dataset.lightboxSrc)));
lb?.addEventListener("click", e => { if (e.target === lb || e.target.closest("button")) closeLb(); });
document.addEventListener("keydown", e => e.key === "Escape" && closeLb());

// generic analytics hooks
document.addEventListener("click", e => { const t = e.target.closest("[data-track]"); if (t) track(t.dataset.track); });

// ---------------------------------------------------------------- Firebase status + Remote Config
const fbStatus = $("#fbStatus");
if (isConfigured) firestore().then(f => { if (f && fbStatus) { fbStatus.classList.add("live"); $("span", fbStatus).textContent = "Live"; } });
remoteConfig().then(rc => { const t = rc?.string("announcement_text")?.trim(); if (t && $("#announcementText")) $("#announcementText").textContent = t; }).catch(() => {});

// ---------------------------------------------------------------- shared helpers
const clean = v => String(v ?? "").trim();
const say = (el, text, type = "") => { if (!el) return; el.textContent = text; el.classList.remove("success", "error"); type && el.classList.add(type); };
function markInvalid(form) {
  let first = null;
  $$("input, select, textarea", form).forEach(el => {
    if (el.classList.contains("hp") || el.type === "file" || el.type === "radio") return;
    const bad = !el.checkValidity(); el.setAttribute("aria-invalid", String(bad)); if (bad && !first) first = el;
  });
  first?.focus(); return !first;
}
const setBusy = (btn, on, label) => { btn.disabled = on; btn.classList.toggle("loading", on); if (label) $(".submit-label", btn).textContent = label; };
// service links on other pages → carry the choice to the home-page quote wizard
if (!$("#quoteWizard")) $$(".service-quote").forEach(a => a.addEventListener("click", () => { try { sessionStorage.setItem("om-service", a.dataset.service); } catch {} }));

// ---------------------------------------------------------------- newsletter (footer + section + newsletter page)
async function subscribe(form, statusEl) {
  if (form.website?.value) return;
  const email = clean(form.email.value).toLowerCase();
  if (!form.email.checkValidity() || !email) { form.email.setAttribute("aria-invalid", "true"); say(statusEl, "Please enter a valid email address.", "error"); return; }
  if (form.consent && !form.consent.checked) { say(statusEl, "Please tick the box to confirm you'd like our emails.", "error"); form.consent.focus(); return; }
  const interests = $$('input[name="interests"]:checked', form).map(i => i.value);
  const name = form.fname ? clean(form.fname.value) : "";
  const btn = $("button[type=submit]", form); btn.disabled = true;
  const f = await firestore();
  try {
    if (!f) throw new Error("offline");
    await f.fs.addDoc(f.fs.collection(f.db, "newsletterSubscribers"), {
      email, name, interests, source: document.body.dataset.page || "site", status: "active", consent: true, createdAt: f.fs.serverTimestamp()
    });
    track("sign_up", { method: "newsletter", interests: interests.join(",") });
    say(statusEl, "🎉 You're subscribed! Watch your inbox for OM drops and offers.", "success");
    form.reset();
  } catch (err) {
    if (err.message !== "offline") console.warn("[OM] newsletter save failed", err);
    say(statusEl, "Opening your email app so you can confirm your subscription…");
    location.href = `mailto:${EMAIL}?subject=${encodeURIComponent("Subscribe me to the OM newsletter")}&body=${encodeURIComponent(`Please add ${email} to the OM Ltd newsletter.${interests.length ? "\nInterests: " + interests.join(", ") : ""}`)}`;
  }
  btn.disabled = false;
}
$$("form[data-newsletter], #newsForm").forEach(form => {
  const statusEl = form.id === "newsForm" ? $("#newsStatus") : $(".news-status", form.parentElement) || $(".form-status", form);
  form.addEventListener("submit", e => { e.preventDefault(); subscribe(form, statusEl); });
});

const unsubForm = $("#unsubForm");
unsubForm?.addEventListener("submit", async e => {
  e.preventDefault();
  const st = $("#unsubStatus");
  if (!unsubForm.email.checkValidity()) { unsubForm.email.setAttribute("aria-invalid", "true"); return say(st, "Please enter a valid email address.", "error"); }
  const email = clean(unsubForm.email.value).toLowerCase();
  const f = await firestore();
  try {
    if (!f) throw new Error("offline");
    await f.fs.addDoc(f.fs.collection(f.db, "newsletterUnsubscribes"), { email, reason: clean(unsubForm.reason?.value).slice(0, 300), createdAt: f.fs.serverTimestamp() });
    say(st, "Done — you've been removed from the OM newsletter. Sorry to see you go 💧", "success"); unsubForm.reset();
  } catch {
    location.href = `mailto:${EMAIL}?subject=${encodeURIComponent("Unsubscribe from OM newsletter")}&body=${encodeURIComponent(`Please remove ${email} from the OM Ltd newsletter.`)}`;
  }
});
if (unsubForm && new URLSearchParams(location.search).get("email")) unsubForm.email.value = new URLSearchParams(location.search).get("email");

// ---------------------------------------------------------------- reviews page
const reviewsEl = $("#reviews");
if (reviewsEl) {
  firestore().then(async f => {
    if (!f) return;
    const { fs, db } = f;
    try {
      const snap = await fs.getDocs(fs.query(fs.collection(db, "testimonials"), fs.where("approved", "==", true), fs.orderBy("createdAt", "desc"), fs.limit(30)));
      if (snap.empty) return;
      $("#reviewsEmpty").hidden = true;
      snap.forEach(d => {
        const r = d.data(), el = document.createElement("article");
        el.className = "card review";
        const ini = (r.name || "?").split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase();
        el.innerHTML = `<div class="stars" aria-label="${r.rating} out of 5 stars">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</div><blockquote></blockquote><footer><span class="ini"></span><div><b></b><small></small></div></footer>`;
        $("blockquote", el).textContent = `“${r.message}”`; $(".ini", el).textContent = ini; $("b", el).textContent = r.name;
        $("small", el).textContent = [r.org, r.service].filter(Boolean).join(" · ");
        reviewsEl.appendChild(el);
      });
    } catch (err) { console.warn("[OM] reviews load failed (create the Firestore index if prompted):", err); }
  });
}
const reviewForm = $("#reviewForm");
reviewForm?.addEventListener("submit", async e => {
  e.preventDefault();
  const st = $("#reviewStatus"), btn = $("button[type=submit]", reviewForm);
  if (reviewForm.website.value) return;
  if (!reviewForm.querySelector('input[name="rating"]:checked')) return say(st, "Please choose a star rating.", "error");
  if (!markInvalid(reviewForm)) return say(st, "Please complete the highlighted fields.", "error");
  const fd = Object.fromEntries(new FormData(reviewForm));
  const data = { name: clean(fd.name), org: clean(fd.org), service: fd.service || "", message: clean(fd.message), rating: Number(fd.rating), consent: true };
  setBusy(btn, true, "Submitting…");
  const f = await firestore();
  try {
    if (!f) throw new Error("offline");
    await f.fs.addDoc(f.fs.collection(f.db, "testimonials"), { ...data, approved: false, createdAt: f.fs.serverTimestamp() });
    track("review_submitted", { rating: data.rating });
    say(st, "Thank you! Your review will appear once the OM team has approved it. 💙", "success"); reviewForm.reset();
  } catch {
    location.href = `https://wa.me/254714995749?text=${encodeURIComponent(`OM Ltd review (${data.rating}★) from ${data.name}${data.org ? ", " + data.org : ""}:\n\n${data.message}\n\nI give permission to publish this review.`)}`;
  }
  setBusy(btn, false, "Submit review");
});

// ---------------------------------------------------------------- shop: tabs, colour swatches, enquiry tray
const tabs = $$(".tab[role=tab][aria-controls]");
if (tabs.length) {
  const show = (tab, focus) => {
    tabs.forEach(t => { const on = t === tab; t.setAttribute("aria-selected", String(on)); t.tabIndex = on ? 0 : -1; $("#" + t.getAttribute("aria-controls")).hidden = !on; });
    if (focus) tab.focus();
    $$(".reveal", $("#" + tab.getAttribute("aria-controls"))).forEach(el => el.classList.add("in"));
    history.replaceState(null, "", "#" + tab.dataset.hash);
    track("view_item_list", { item_list_name: tab.dataset.hash });
  };
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => show(t));
    t.addEventListener("keydown", e => { const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0; if (d) show(tabs[(i + d + tabs.length) % tabs.length], true); });
  });
  const initial = tabs.find(t => "#" + t.dataset.hash === location.hash);
  if (initial) show(initial);
}

$$(".product-hero").forEach(card => {
  const main = $("[data-main]", card), label = $("[data-colour-name]", card), sw = $$(".swatch", card);
  const heroSrc = main?.getAttribute("src");
  let current = sw[0]?.dataset.name;
  sw.forEach(s => s.addEventListener("click", () => {
    sw.forEach(x => x.setAttribute("aria-pressed", String(x === s)));
    current = s.dataset.name;
    label.innerHTML = ""; label.textContent = s.dataset.name;
    if (s.dataset.limited) label.insertAdjacentHTML("beforeend", ' <span class="badge-limited">LIMITED</span>');
    main.classList.add("swap");
    setTimeout(() => { main.src = s === sw[0] ? heroSrc : s.dataset.img; main.onload = () => main.classList.remove("swap"); }, 220);
    track("select_item", { item_name: card.dataset.product, item_variant: current });
  }));
  $("[data-add-hero]", card)?.addEventListener("click", e => addItem(`${card.dataset.product} — ${current}`, e.currentTarget));
});

const TRAY_KEY = "om-enquiry-list";
let list = []; try { list = JSON.parse(sessionStorage.getItem(TRAY_KEY) || "[]"); } catch {}
const tray = $("#tray");
function renderTray() {
  if (!tray) return;
  $("#trayCount").textContent = list.length;
  $("#trayText").textContent = list.length ? (list.length === 1 ? list[0] : `${list.length} items in your enquiry`) : "";
  tray.classList.toggle("on", list.length > 0);
  $$("[data-add]").forEach(b => b.classList.toggle("added", list.includes(b.dataset.add)));
  try { sessionStorage.setItem(TRAY_KEY, JSON.stringify(list)); } catch {}
}
function addItem(item, btn) {
  if (!list.includes(item)) { list.push(item); toast(`Added: ${item}`); track("add_to_cart", { item_name: item }); }
  else toast("Already in your enquiry list");
  btn?.animate?.([{ transform: "scale(1)" }, { transform: "scale(1.25)" }, { transform: "scale(1)" }], { duration: 400, easing: "cubic-bezier(.34,1.56,.64,1)" });
  renderTray();
}
$$("[data-add]").forEach(b => b.addEventListener("click", () => {
  if (list.includes(b.dataset.add)) { list = list.filter(x => x !== b.dataset.add); renderTray(); } else addItem(b.dataset.add, b);
}));
$("#trayClear")?.addEventListener("click", () => { list = []; renderTray(); });
renderTray();

// ---------------------------------------------------------------- OM AI chat + quote wizard
try { initChat(); } catch (e) { console.error("[OM] OM AI failed to start", e); }
try { initQuote({ toast }); } catch (e) { console.error("[OM] quote wizard failed to start", e); }

// PWA-ish: nothing cached on purpose (always fresh deploys). Manifest only.
