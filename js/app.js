// =============================================================
// OM Ltd — site interactions + Firebase-powered forms
// =============================================================
import { isConfigured, firestore, storage, track, remoteConfig } from "./firebase.js";
import { initMo } from "./mo-ai.js";

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

const toTop = $(".to-top"), ring = $(".to-top .ring");
const onScroll = () => {
  const y = scrollY;
  header?.classList.toggle("scrolled", y > 10);
  toTop?.classList.toggle("on", y > 600);
  if (ring) { const max = document.documentElement.scrollHeight - innerHeight; ring.style.strokeDashoffset = String(125.7 * (1 - Math.min(1, y / Math.max(1, max)))); }
};
onScroll(); addEventListener("scroll", onScroll, { passive: true });
toTop?.addEventListener("click", () => scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" }));
$$("[data-year]").forEach(el => el.textContent = new Date().getFullYear());

// ---------------------------------------------------------------- ambient effects
const drops = $(".bg-drops");
if (drops && !reduced) for (let i = 0; i < 14; i++) {
  const s = document.createElement("span");
  s.style.left = Math.random() * 100 + "%"; s.style.animationDuration = 12 + Math.random() * 16 + "s"; s.style.animationDelay = -Math.random() * 20 + "s";
  const z = 3 + Math.random() * 5; s.style.width = s.style.height = z + "px";
  drops.appendChild(s);
}
const spot = $(".spotlight");
const fine = matchMedia("(pointer: fine)").matches;
if (fine && !reduced) {
  let raf = 0, mx = 0, my = 0;
  addEventListener("pointermove", e => {
    mx = e.clientX; my = e.clientY;
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      spot?.style.setProperty("--sx", mx + "px"); spot?.style.setProperty("--sy", my + "px");
      // robot eyes follow the cursor
      $$(".mo-bot .pupils").forEach(p => {
        const r = p.ownerSVGElement.getBoundingClientRect(); if (!r.width) return;
        const dx = (mx - (r.left + r.width / 2)) / innerWidth, dy = (my - (r.top + r.height * .38)) / innerHeight;
        p.setAttribute("transform", `translate(${(dx * 14).toFixed(1)} ${(dy * 10).toFixed(1)})`);
      });
    });
  }, { passive: true });
}
// glass cursor-light + tilt
$$(".glass-hover").forEach(card => {
  card.addEventListener("pointermove", e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", e.clientX - r.left + "px"); card.style.setProperty("--my", e.clientY - r.top + "px");
    if (card.hasAttribute("data-tilt") && fine && !reduced) {
      const rx = ((e.clientY - r.top) / r.height - .5) * -6, ry = ((e.clientX - r.left) / r.width - .5) * 8;
      card.style.transform = `translateY(-6px) perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    }
  });
  card.addEventListener("pointerleave", () => { card.style.transform = ""; });
});

// reveal on scroll + counters
const io = "IntersectionObserver" in window ? new IntersectionObserver(entries => entries.forEach(en => {
  if (!en.isIntersecting) return;
  en.target.classList.add("in");
  $$("[data-count]", en.target).forEach(countUp);
  io.unobserve(en.target);
}), { threshold: .12, rootMargin: "0px 0px -40px 0px" }) : null;
$$(".reveal").forEach(el => io ? io.observe(el) : el.classList.add("in"));
function countUp(el) {
  const to = +el.dataset.count; if (reduced) { el.textContent = to; return; }
  const t0 = performance.now(), d = 1400;
  const step = t => { const p = Math.min(1, (t - t0) / d); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}

// hero typewriter
const typeEl = $("#heroType");
if (typeEl) {
  const lines = ["Need drip irrigation for your farm?", "Planning a new bathroom?", "Kitting out a site crew?", "Want OM backpacks for your team?", "Habari! Niulize chochote."];
  let li = 0, ci = 0, del = false;
  const tick = () => {
    const full = lines[li];
    typeEl.textContent = full.slice(0, ci);
    if (!del && ci < full.length) ci++; else if (!del) { del = true; return setTimeout(tick, 1800); }
    else if (ci > 0) ci--; else { del = false; li = (li + 1) % lines.length; }
    setTimeout(tick, del ? 28 : 55);
  };
  reduced ? (typeEl.textContent = lines[0]) : setTimeout(tick, 1600);
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
remoteConfig().then(rc => { const t = rc?.string("announcement_text"); if (t && $("#announcementText")) $("#announcementText").textContent = t; }).catch(() => {});

// ---------------------------------------------------------------- service pre-selection
const select = $("#serviceSelect");
const remember = (k, v) => { try { sessionStorage.setItem(k, v); } catch {} };
$$(".service-quote").forEach(a => a.addEventListener("click", () => {
  if (select) { select.value = a.dataset.service; select.dispatchEvent(new Event("change")); }
  else remember("om-service", a.dataset.service);
}));
if (select) {
  try {
    const s = sessionStorage.getItem("om-service"), d = sessionStorage.getItem("om-details"), list = sessionStorage.getItem("om-enquiry-list");
    if (s) { select.value = s; sessionStorage.removeItem("om-service"); }
    const ta = $('#quoteForm textarea[name="details"]');
    if (ta) {
      const parts = [];
      if (list) { const items = JSON.parse(list); if (items.length) { parts.push("Items I'm interested in:\n" + items.map(i => `• ${i}`).join("\n")); if (!s) select.value = "Branded merchandise"; } }
      if (d) { parts.push(d); sessionStorage.removeItem("om-details"); }
      if (parts.length && !ta.value) ta.value = parts.join("\n\n");
    }
  } catch {}
}

// ---------------------------------------------------------------- shared form helpers
const clean = v => String(v ?? "").trim();
const refCode = () => "OM-" + Date.now().toString(36).toUpperCase().slice(-5) + Math.random().toString(36).slice(2, 5).toUpperCase();
function markInvalid(form) {
  let first = null;
  $$("input, select, textarea", form).forEach(el => {
    if (el.classList.contains("hp") || el.type === "file") return;
    const bad = !el.checkValidity(); el.setAttribute("aria-invalid", String(bad));
    if (bad && !first) first = el;
  });
  first?.focus(); return !first;
}
$$("input, select, textarea").forEach(el => el.addEventListener("input", () => el.removeAttribute("aria-invalid")));
const setBusy = (btn, on, label) => { btn.disabled = on; btn.classList.toggle("loading", on); if (label) $(".submit-label", btn).textContent = label; };
const say = (el, text, type = "") => { if (!el) return; el.textContent = text; el.classList.remove("success", "error"); type && el.classList.add(type); };

// ---------------------------------------------------------------- quote form (+ Storage attachments)
const quoteForm = $("#quoteForm");
if (quoteForm) {
  const status = $("#formStatus"), btn = $("button[type=submit]", quoteForm);
  const fileInput = $("#files"), fileList = $("#fileList"), dz = $("#dropzone"), prog = $("#uploadProgress");
  const MAX = 3, MAX_MB = 8, OK = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
  let files = [];
  const renderFiles = () => {
    fileList.innerHTML = "";
    files.forEach((f, i) => {
      const p = document.createElement("span"); p.className = "file-pill"; p.textContent = `📎 ${f.name} (${(f.size / 1048576).toFixed(1)} MB)`;
      const x = document.createElement("button"); x.type = "button"; x.textContent = "×"; x.setAttribute("aria-label", `Remove ${f.name}`); x.onclick = () => { files.splice(i, 1); renderFiles(); };
      p.appendChild(x); fileList.appendChild(p);
    });
  };
  const addFiles = list => {
    for (const f of list) {
      if (files.length >= MAX) { toast(`You can attach up to ${MAX} files.`); break; }
      if (!OK.includes(f.type)) { toast(`${f.name}: please use JPG, PNG, WEBP or PDF.`); continue; }
      if (f.size > MAX_MB * 1048576) { toast(`${f.name} is larger than ${MAX_MB} MB.`); continue; }
      files.push(f);
    }
    renderFiles();
  };
  fileInput?.addEventListener("change", () => { addFiles(fileInput.files); fileInput.value = ""; });
  ["dragenter", "dragover"].forEach(ev => dz?.addEventListener(ev, e => { e.preventDefault(); dz.classList.add("drag"); }));
  ["dragleave", "drop"].forEach(ev => dz?.addEventListener(ev, e => { e.preventDefault(); dz.classList.remove("drag"); }));
  dz?.addEventListener("drop", e => addFiles(e.dataTransfer.files));

  const mailto = d => `mailto:${EMAIL}?subject=${encodeURIComponent(`OM Ltd quotation request – ${d.service} (${d.ref})`)}&body=${encodeURIComponent(
`New quotation request (${d.ref})

Name: ${d.name}
Company: ${d.company || "—"}
Email: ${d.email}
Phone: ${d.phone}
Service: ${d.service}
Location: ${d.location || "—"}
Budget: ${d.budget || "—"}

Requirements:
${d.details}
${files.length ? `\n(I have ${files.length} attachment(s) — I'll attach them to this email.)` : ""}`)}`;

  async function uploadAll(ref) {
    if (!files.length) return [];
    const s = await storage(); if (!s) throw new Error("storage-unavailable");
    const { st, storage: bucket } = s;
    prog.classList.add("on");
    const total = files.reduce((a, f) => a + f.size, 0); const done = new Map();
    const urls = await Promise.all(files.map((f, i) => new Promise((res, rej) => {
      const safe = f.name.replace(/[^\w.\-]+/g, "_").slice(-80);
      const r = st.ref(bucket, `quote-uploads/${ref}/${i}-${safe}`);
      const task = st.uploadBytesResumable(r, f, { contentType: f.type });
      task.on("state_changed", snap => { done.set(i, snap.bytesTransferred); $("span", prog).style.width = (100 * [...done.values()].reduce((a, b) => a + b, 0) / total).toFixed(0) + "%"; },
        rej, () => res({ name: f.name, path: r.fullPath, size: f.size, type: f.type }));
    })));
    return urls;
  }

  quoteForm.addEventListener("submit", async e => {
    e.preventDefault();
    if (quoteForm.website.value) return; // honeypot
    if (!markInvalid(quoteForm)) { say(status, "Please complete the highlighted fields.", "error"); return; }
    const fd = Object.fromEntries(new FormData(quoteForm));
    if (!/^[0-9+()\s-]{7,}$/.test(fd.phone)) { quoteForm.phone.setAttribute("aria-invalid", "true"); quoteForm.phone.focus(); say(status, "Please enter a valid phone number.", "error"); return; }
    const data = { ref: refCode(), name: clean(fd.name), company: clean(fd.company), email: clean(fd.email), phone: clean(fd.phone), service: fd.service,
      location: clean(fd.location), budget: fd.budget || "", details: clean(fd.details), consent: fd.consent === "on" };

    setBusy(btn, true, "Sending…"); say(status, "Sending your request securely…");
    const f = await firestore();
    if (f) {
      try {
        let attachments = [];
        try { attachments = await uploadAll(data.ref); }
        catch (err) { console.warn("[OM] upload failed", err); if (files.length) toast("Attachments couldn't upload — we'll still send your request. You can share files on WhatsApp."); }
        await f.fs.addDoc(f.fs.collection(f.db, "quotationRequests"), {
          ...data, attachments, status: "new", source: "om-website", page: location.pathname,
          userAgent: navigator.userAgent.slice(0, 200), createdAt: f.fs.serverTimestamp()
        });
        track("generate_lead", { service: data.service, currency: "KES", attachments: attachments.length });
        $("#refCode").textContent = data.ref;
        quoteForm.reset(); files = []; renderFiles(); prog.classList.remove("on");
        try { sessionStorage.removeItem("om-enquiry-list"); } catch {}
        quoteForm.hidden = true; $("#quoteSuccess").classList.add("on");
        $("#quoteSuccess").scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
      } catch (err) {
        console.error("[OM] quote save failed", err);
        say(status, "We couldn't send this online, so your email app will open with everything filled in.", "error");
        location.href = mailto(data);
      }
    } else {
      say(status, "Opening your email app with your request ready to send…");
      track("generate_lead", { service: data.service, method: "email" });
      location.href = mailto(data);
    }
    setBusy(btn, false, "Send quotation request");
  });
  $("#newQuote")?.addEventListener("click", () => { $("#quoteSuccess").classList.remove("on"); quoteForm.hidden = false; say(status, "Your details are only used to respond to your enquiry."); });
}

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
        el.className = "review glass glass-hover";
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

// ---------------------------------------------------------------- Mo AI
initMo();

// PWA-ish: nothing cached on purpose (always fresh deploys). Manifest only.
