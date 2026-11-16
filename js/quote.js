// =============================================================
// OM Ltd — 4-step quotation wizard + Kenya map (Leaflet + OpenStreetMap)
// =============================================================
import { firestore, storage, track } from "./firebase.js";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const EMAIL = "oandmlimited@gmail.com";
const WA = "https://wa.me/254714995749";

// 47 counties with approximate county-town coordinates (for map centring)
export const COUNTIES = [
  ["Baringo", 0.49, 35.74], ["Bomet", -0.78, 35.34], ["Bungoma", 0.56, 34.56], ["Busia", 0.46, 34.11], ["Elgeyo-Marakwet", 0.67, 35.51],
  ["Embu", -0.53, 37.45], ["Garissa", -0.45, 39.65], ["Homa Bay", -0.53, 34.46], ["Isiolo", 0.35, 37.58], ["Kajiado", -1.85, 36.78],
  ["Kakamega", 0.28, 34.75], ["Kericho", -0.37, 35.28], ["Kiambu", -1.17, 36.83], ["Kilifi", -3.63, 39.85], ["Kirinyaga", -0.50, 37.28],
  ["Kisii", -0.68, 34.77], ["Kisumu", -0.09, 34.77], ["Kitui", -1.37, 38.01], ["Kwale", -4.17, 39.45], ["Laikipia", 0.03, 36.90],
  ["Lamu", -2.27, 40.90], ["Machakos", -1.52, 37.26], ["Makueni", -1.78, 37.63], ["Mandera", 3.94, 41.86], ["Marsabit", 2.33, 37.99],
  ["Meru", 0.05, 37.65], ["Migori", -1.06, 34.47], ["Mombasa", -4.04, 39.67], ["Murang'a", -0.72, 37.15], ["Nairobi", -1.29, 36.82],
  ["Nakuru", -0.30, 36.07], ["Nandi", 0.20, 35.10], ["Narok", -1.08, 35.87], ["Nyamira", -0.57, 34.94], ["Nyandarua", -0.27, 36.38],
  ["Nyeri", -0.42, 36.95], ["Samburu", 1.10, 36.70], ["Siaya", 0.06, 34.29], ["Taita-Taveta", -3.40, 38.56], ["Tana River", -1.50, 40.03],
  ["Tharaka-Nithi", -0.33, 37.65], ["Trans-Nzoia", 1.02, 35.00], ["Turkana", 3.12, 35.60], ["Uasin Gishu", 0.51, 35.27], ["Vihiga", 0.08, 34.72],
  ["Wajir", 1.75, 40.06], ["West Pokot", 1.24, 35.11]
];

// Quick-pick questions per service — tapping is faster than typing
const SCOPES = {
  "Plumbing installation and repairs": [
    ["What's needed", ["Leak / burst (urgent)", "New installation", "Repair", "Renovation", "Maintenance"]],
    ["Areas", ["Bathroom", "Kitchen", "Drainage & sewer", "Water tank & pump", "Water heater / solar", "Whole building"], true],
    ["Property", ["Home", "Office / shop", "Hotel / school", "Farm", "Industrial"]]
  ],
  "Construction and renovation": [
    ["Project", ["New building", "Renovation", "Finishing", "Water & site works", "Estimate / planning only"], true],
    ["Property", ["Home", "Commercial", "Farm structure", "Institution"]],
    ["Stage", ["Just planning", "Have drawings", "Ready to start", "Already started"]]
  ],
  "Irrigation and farm supplies": [
    ["Farm size", ["Kitchen garden", "Under 1 acre", "1–5 acres", "5–20 acres", "20+ acres"]],
    ["System", ["Drip", "Sprinkler / lawn", "Solar pump & water supply", "Maintenance / repair", "Not sure — advise me"], true],
    ["Water source", ["Borehole", "Tank", "River / dam", "Mains"]],
    ["Crops", ["Vegetables", "Fruit trees", "Greenhouse", "Lawn / landscape", "Pasture"], true]
  ],
  "Workwear and safety equipment": [
    ["Team size", ["1–10", "11–50", "51–200", "200+"]],
    ["Items", ["Coveralls", "Hi-vis vests", "Polo shirts", "Jackets", "Safety boots", "Hard hats", "Gloves & glasses"], true],
    ["Branding", ["Our logo", "OM branding", "Plain"]]
  ],
  "Branded merchandise": [
    ["Items", ["OM Smart Backpack", "OM Notebook", "Polo shirts", "Water bottles", "Other custom item"], true],
    ["Quantity", ["10–50", "51–200", "201–500", "500+"]],
    ["Deadline", ["This month", "1–2 months", "Flexible"]]
  ],
  "Multiple services / Other enquiry": [
    ["Interested in", ["Plumbing", "Construction", "Irrigation", "Workwear", "Merch"], true]
  ]
};
const SHORT = { "Plumbing installation and repairs": "Plumbing", "Irrigation and farm supplies": "Irrigation & farm", "Construction and renovation": "Construction",
  "Workwear and safety equipment": "Workwear & PPE", "Branded merchandise": "Branded merch", "Multiple services / Other enquiry": "Something else" };

export function initQuote({ toast } = {}) {
  const wizard = $("#quoteWizard"); if (!wizard) return;
  const form = $("#quoteForm"), status = $("#formStatus");
  const steps = $$(".wz-step", form), dots = $$("[data-step-dot]", wizard);
  const back = $("#wzBack"), next = $("#wzNext"), submit = $("#wzSubmit"), count = $("#wzCount");
  let step = 1, files = [], coords = null, extraDetails = "";
  const say = (t, type = "") => { status.textContent = t; status.className = "form-status" + (type ? " " + type : ""); };
  const service = () => form.querySelector('input[name="service"]:checked')?.value || "";

  // ---------- step navigation ----------
  function show(n, focus = true) {
    step = n;
    steps.forEach(s => s.hidden = +s.dataset.step !== n);
    dots.forEach(d => { const k = +d.dataset.stepDot; d.classList.toggle("active", k === n); d.classList.toggle("done", k < n); });
    back.hidden = n === 1; next.hidden = n === 4; submit.hidden = n !== 4;
    count.textContent = `Step ${n} of 4`;
    say("");
    if (n === 2) renderScopes();
    if (n === 3) initMap();
    if (n === 4) renderSummary();
    if (focus) {
      const top = wizard.getBoundingClientRect().top;
      if (top < 0 || top > innerHeight * .5) wizard.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => steps[n - 1].querySelector("input:not(.sr-only),textarea,select,.opt-card input")?.focus({ preventScroll: true }), 300);
    }
    track("quote_step", { step: n });
  }
  function valid(n) {
    if (n === 1 && !service()) { say("Please choose a service to continue.", "error"); return false; }
    if (n === 4) {
      let first = null;
      for (const el of [form.name, form.phone, form.email, form.consent]) {
        let bad = !el.checkValidity();
        if (el === form.phone && el.value && !/^[0-9+()\s-]{7,}$/.test(el.value)) bad = true;
        el.setAttribute("aria-invalid", String(bad)); if (bad && !first) first = el;
      }
      if (first) { first.focus(); say(first === form.consent ? "Please tick the consent box." : "Please check the highlighted fields.", "error"); return false; }
    }
    return true;
  }
  next.addEventListener("click", () => { if (valid(step)) show(step + 1); });
  back.addEventListener("click", () => show(step - 1));
  // choosing a service moves forward automatically
  form.addEventListener("change", e => { if (e.target.name === "service" && step === 1) setTimeout(() => show(2), 180); });
  $$("input,textarea,select", form).forEach(el => el.addEventListener("input", () => el.removeAttribute("aria-invalid")));

  // pre-select from service cards, OM AI and the shop tray
  const LEGACY = { "Plumbing installation solutions": "Plumbing installation and repairs", "Greenhouse, tanks and drainage": "Plumbing installation and repairs" };
  function preselect(svc, details) {
    svc = LEGACY[svc] || svc;
    const r = form.querySelector(`input[name="service"][value="${CSS.escape(svc)}"]`);
    if (r) { r.checked = true; }
    if (details) extraDetails = details;
    if (details && !form.details.value) form.details.value = details;
    show(r ? 2 : 1, false);
    document.getElementById("quote")?.scrollIntoView({ behavior: "smooth" });
  }
  $$(".service-quote").forEach(a => a.addEventListener("click", e => { e.preventDefault(); preselect(a.dataset.service); }));
  window.addEventListener("om:quote", e => preselect(e.detail.service, e.detail.details));
  try {
    const s = sessionStorage.getItem("om-service"), d = sessionStorage.getItem("om-details"), list = JSON.parse(sessionStorage.getItem("om-enquiry-list") || "[]");
    const parts = [];
    if (list.length) parts.push("Items I'm interested in:\n" + list.map(i => `• ${i}`).join("\n"));
    if (d) parts.push(d);
    if (s || parts.length) { preselect(s || (list.length ? "Branded merchandise" : ""), parts.join("\n\n")); sessionStorage.removeItem("om-service"); sessionStorage.removeItem("om-details"); }
  } catch {}

  // ---------- step 2: quick-pick scope chips ----------
  let scopeFor = "";
  function renderScopes() {
    const svc = service(); $("#wzServiceName").textContent = SHORT[svc] || "";
    if (scopeFor === svc) return; scopeFor = svc;
    $("#scopeGroups").innerHTML = (SCOPES[svc] || []).map(([label, opts, multi], gi) => `
      <div class="scope"><div class="wz-label">${label}${multi ? ' <span class="opt">(pick any)</span>' : ""}</div>
      <div class="chips" role="${multi ? "group" : "radiogroup"}" aria-label="${label}">${opts.map(o => `<label class="chip"><input class="sr-only" type="${multi ? "checkbox" : "radio"}" name="scope-${gi}" value="${o}" data-label="${label}">${o}</label>`).join("")}</div></div>`).join("");
  }
  $("#scopeGroups").addEventListener("change", e => {
    if (e.target.value === "Leak / burst (urgent)" && e.target.checked) toast?.("Urgent leak? We handle emergencies 24 hours — WhatsApp +254 714 995 749 for the fastest response.", 7000);
  });
  const scopeText = () => {
    const groups = {};
    $$("#scopeGroups input:checked").forEach(i => (groups[i.dataset.label] ||= []).push(i.value));
    return Object.entries(groups).map(([k, v]) => `${k}: ${v.join(", ")}`).join("\n");
  };

  // ---------- attachments ----------
  const fileInput = $("#files"), fileList = $("#fileList"), dz = $("#dropzone"), prog = $("#uploadProgress");
  const MAX = 3, MAX_MB = 8, OK = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
  const renderFiles = () => {
    fileList.innerHTML = "";
    files.forEach((f, i) => {
      const p = document.createElement("span"); p.className = "file-pill"; p.textContent = `📎 ${f.name}`;
      const x = document.createElement("button"); x.type = "button"; x.textContent = "×"; x.setAttribute("aria-label", `Remove ${f.name}`); x.onclick = () => { files.splice(i, 1); renderFiles(); };
      p.appendChild(x); fileList.appendChild(p);
    });
  };
  const addFiles = list => { for (const f of list) {
    if (files.length >= MAX) { toast?.(`You can attach up to ${MAX} files.`); break; }
    if (!OK.includes(f.type)) { toast?.(`${f.name}: use JPG, PNG, WEBP or PDF.`); continue; }
    if (f.size > MAX_MB * 1048576) { toast?.(`${f.name} is larger than ${MAX_MB} MB.`); continue; }
    files.push(f); } renderFiles(); };
  fileInput.addEventListener("change", () => { addFiles(fileInput.files); fileInput.value = ""; });
  ["dragenter", "dragover"].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.add("drag"); }));
  ["dragleave", "drop"].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.remove("drag"); }));
  dz.addEventListener("drop", e => addFiles(e.dataTransfer.files));

  // ---------- step 3: Kenya map ----------
  const countySel = $("#countySelect"), town = $("#townSearch"), townList = $("#townList"), pinLabel = $("#pinLabel");
  countySel.insertAdjacentHTML("beforeend", COUNTIES.map(([n]) => `<option>${n}</option>`).join(""));
  let map = null, marker = null, L = null;
  async function loadLeaflet() {
    if (window.L) return window.L;
    const css = document.createElement("link"); css.rel = "stylesheet"; css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    css.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="; css.crossOrigin = ""; document.head.appendChild(css);
    await new Promise((res, rej) => { const s = document.createElement("script"); s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      s.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="; s.crossOrigin = ""; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
    return window.L;
  }
  async function initMap() {
    if (map) { setTimeout(() => map.invalidateSize(), 50); return; }
    try {
      L = await loadLeaflet();
      map = L.map("kenyaMap", { zoomControl: true, scrollWheelZoom: false, maxBounds: [[-6, 32.5], [6.2, 43.5]], minZoom: 5 }).setView([0.2, 37.9], 6);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(map);
      map.on("click", e => setPin(e.latlng.lat, e.latlng.lng, null, true));
      if (coords) setPin(coords.lat, coords.lng, null, false);
      setTimeout(() => map.invalidateSize(), 80);
    } catch (e) {
      $("#kenyaMap").innerHTML = '<p class="map-hint" style="padding:1rem">The map couldn\'t load — just pick your county and type your town.</p>';
    }
  }
  const pinIcon = () => L.divIcon({ className: "", html: '<svg width="34" height="44" viewBox="0 0 34 44"><path d="M17 1C8.2 1 1 8 1 16.7 1 28.5 17 43 17 43s16-14.5 16-26.3C33 8 25.8 1 17 1z" fill="#1456e0" stroke="#fff" stroke-width="2"/><path d="M17 9s-6 6.4-6 10.5a6 6 0 0 0 12 0C23 15.4 17 9 17 9z" fill="#fff"/></svg>', iconSize: [34, 44], iconAnchor: [17, 43] });
  async function setPin(lat, lng, label, reverse) {
    coords = { lat: +lat.toFixed(5), lng: +lng.toFixed(5) };
    if (map) {
      if (!marker) marker = L.marker([lat, lng], { icon: pinIcon(), draggable: true }).addTo(map).on("dragend", ev => { const p = ev.target.getLatLng(); setPin(p.lat, p.lng, null, true); });
      else marker.setLatLng([lat, lng]);
      map.setView([lat, lng], Math.max(map.getZoom(), 12));
    }
    if (label) { pinLabel.innerHTML = `📍 Pinned: <b></b>`; pinLabel.querySelector("b").textContent = label; }
    else pinLabel.textContent = "📍 Pin dropped — finding the area…";
    if (reverse) {
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=14&accept-language=en&lat=${lat}&lon=${lng}`).then(r => r.json());
        const a = r.address || {};
        const place = a.town || a.city || a.village || a.suburb || a.hamlet || a.municipality || "";
        const county = (a.state || a.county || "").replace(/ County$/i, "");
        if (place && !town.value) town.value = place;
        const match = COUNTIES.find(([n]) => county.toLowerCase().includes(n.toLowerCase().split("-")[0]));
        if (match && !countySel.value) countySel.value = match[0];
        pinLabel.innerHTML = "📍 Pinned: <b></b> <small>(drag the pin to adjust)</small>";
        pinLabel.querySelector("b").textContent = [place, county].filter(Boolean).join(", ") || `${coords.lat}, ${coords.lng}`;
      } catch { pinLabel.textContent = `📍 Pinned at ${coords.lat}, ${coords.lng} (drag to adjust)`; }
    }
  }
  countySel.addEventListener("change", () => {
    const c = COUNTIES.find(([n]) => n === countySel.value);
    if (c && map) { map.setView([c[1], c[2]], 9); }
    if (c && !coords) pinLabel.innerHTML = `County: <b>${c[0]}</b> — tap the map to pin your exact site (optional).`;
  });
  // town search (OpenStreetMap Nominatim, Kenya only)
  let tmr, results = [], active = -1;
  town.addEventListener("input", () => {
    clearTimeout(tmr); const q = town.value.trim();
    if (q.length < 3) { townList.hidden = true; town.setAttribute("aria-expanded", "false"); return; }
    tmr = setTimeout(async () => {
      try {
        const cty = countySel.value ? `, ${countySel.value} County` : "";
        const base = "https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=ke&limit=6&accept-language=en&addressdetails=1";
        const get = (query, settle) => fetch(`${base}${settle ? "&featureType=settlement" : ""}&q=${encodeURIComponent(query)}`).then(r => r.json());
        results = await get(q, true);                             // towns & villages first
        if (!results.length) results = await get(q + cty, false);  // then any place (estates, landmarks)
        if (!results.length && cty) results = await get(q, false);
        if (countySel.value) {                                     // chosen county's matches first
          const c = countySel.value.toLowerCase().split("-")[0];
          results.sort((a, b) => (String(b.address?.state || b.address?.county).toLowerCase().includes(c)) - (String(a.address?.state || a.address?.county).toLowerCase().includes(c)));
        }
        active = -1;
        townList.innerHTML = results.length ? results.map((r, i) => { const [name, ...rest] = r.display_name.split(","); return `<li role="option" id="town-${i}" data-i="${i}"><span></span><small></small></li>`; }).join("") : `<li aria-disabled="true"><small>No match — keep typing or tap the map.</small></li>`;
        results.forEach((r, i) => { const [name, ...rest] = r.display_name.split(","); const li = townList.querySelector(`[data-i="${i}"]`); li.querySelector("span").textContent = name; li.querySelector("small").textContent = rest.slice(0, 3).join(",").trim(); });
        townList.hidden = false; town.setAttribute("aria-expanded", "true");
      } catch { townList.hidden = true; }
    }, 420);
  });
  const pick = i => {
    const r = results[i]; if (!r) return;
    town.value = r.display_name.split(",")[0]; townList.hidden = true; town.setAttribute("aria-expanded", "false");
    const county = (r.address?.state || r.address?.county || "").replace(/ County$/i, "");
    const match = COUNTIES.find(([n]) => county.toLowerCase().includes(n.toLowerCase().split("-")[0]));
    if (match) countySel.value = match[0];
    setPin(+r.lat, +r.lon, [town.value, match?.[0]].filter(Boolean).join(", "), false);
  };
  townList.addEventListener("mousedown", e => { const li = e.target.closest("[data-i]"); if (li) { e.preventDefault(); pick(+li.dataset.i); } });
  town.addEventListener("keydown", e => {
    const items = $$("[data-i]", townList); if (townList.hidden || !items.length) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); active = (active + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length; items.forEach((li, i) => li.setAttribute("aria-selected", String(i === active))); town.setAttribute("aria-activedescendant", items[active].id); }
    if (e.key === "Enter" && active >= 0) { e.preventDefault(); pick(active); }
    if (e.key === "Escape") townList.hidden = true;
  });
  town.addEventListener("blur", () => setTimeout(() => { townList.hidden = true; }, 150));
  $("#useMyLocation").addEventListener("click", () => {
    if (!navigator.geolocation) return toast?.("Location isn't available on this device.");
    pinLabel.textContent = "Finding your location…";
    navigator.geolocation.getCurrentPosition(p => setPin(p.coords.latitude, p.coords.longitude, null, true),
      () => { pinLabel.textContent = "Couldn't get your location — pick a county or tap the map instead."; }, { enableHighAccuracy: true, timeout: 10000 });
  });

  // ---------- step 4: summary ----------
  function locationText() { return [town.value.trim(), countySel.value].filter(Boolean).join(", "); }
  function renderSummary() {
    const rows = [["Service", SHORT[service()] || "—", 1], ["Details", scopeText().replace(/\n/g, " · ") || (form.details.value.trim() ? "Described" : "—"), 2],
      ["Location", locationText() || (coords ? "Pinned on map" : "Not given"), 3], ["Files", files.length ? `${files.length} attached` : "None", 2]];
    $("#wzSummary").innerHTML = rows.map(([k, v, s]) => `<div><span class="k">${k}</span><span class="v"></span><button type="button" data-goto="${s}">Edit</button></div>`).join("");
    $$("#wzSummary .v").forEach((el, i) => el.textContent = rows[i][1]);
    $$("#wzSummary [data-goto]").forEach(b => b.onclick = () => show(+b.dataset.goto));
  }

  // ---------- submit ----------
  const refCode = () => "OM-" + Date.now().toString(36).toUpperCase().slice(-5) + Math.random().toString(36).slice(2, 5).toUpperCase();
  function buildDetails() {
    const parts = [scopeText(), form.details.value.trim()].filter(Boolean);
    return parts.join("\n\n") || `Quote request for ${SHORT[service()] || "OM services"}`;
  }
  const mailto = d => `mailto:${EMAIL}?subject=${encodeURIComponent(`Quotation request – ${SHORT[d.service] || d.service} (${d.ref})`)}&body=${encodeURIComponent(
`Quotation request ${d.ref}

Name: ${d.name}
Phone: ${d.phone}
Email: ${d.email || "—"}
Company: ${d.company || "—"}
Service: ${d.service}
Location: ${d.location || "—"}${d.coords ? `\nMap: https://www.openstreetmap.org/?mlat=${d.coords.lat}&mlon=${d.coords.lng}#map=15/${d.coords.lat}/${d.coords.lng}` : ""}
Budget: ${d.budget || "—"}

${d.details}`)}`;

  async function uploadAll(ref) {
    if (!files.length) return [];
    const s = await storage(); if (!s) throw new Error("storage-unavailable");
    const { st, storage: bucket } = s; prog.classList.add("on");
    const total = files.reduce((a, f) => a + f.size, 0), done = new Map();
    return Promise.all(files.map((f, i) => new Promise((res, rej) => {
      const r = st.ref(bucket, `quote-uploads/${ref}/${i}-${f.name.replace(/[^\w.\-]+/g, "_").slice(-80)}`);
      const task = st.uploadBytesResumable(r, f, { contentType: f.type });
      task.on("state_changed", snap => { done.set(i, snap.bytesTransferred); $("span", prog).style.width = (100 * [...done.values()].reduce((a, b) => a + b, 0) / total).toFixed(0) + "%"; },
        rej, () => res({ name: f.name, path: r.fullPath, size: f.size, type: f.type }));
    })));
  }

  form.addEventListener("submit", async e => {
    e.preventDefault();
    if (step !== 4) { if (valid(step)) show(step + 1); return; }
    if (form.website.value) return;
    if (!valid(4)) return;
    const data = { ref: refCode(), name: form.name.value.trim(), phone: form.phone.value.trim(), email: form.email.value.trim(), company: form.company.value.trim(),
      service: service(), budget: form.querySelector('input[name="budget"]:checked')?.value || "", details: buildDetails().slice(0, 5000),
      location: locationText().slice(0, 120), county: countySel.value, consent: true };
    if (coords) data.coords = coords;
    submit.disabled = true; submit.classList.add("loading"); say("Sending your request…");
    const f = await firestore();
    if (f) {
      try {
        let attachments = [];
        try { attachments = await uploadAll(data.ref); } catch (err) { console.warn("[OM] upload failed", err); if (files.length) toast?.("Files couldn't upload — your request is still sent. You can share them on WhatsApp."); }
        await f.fs.addDoc(f.fs.collection(f.db, "quotationRequests"), { ...data, attachments, status: "new", source: "om-website", page: location.pathname.slice(0, 120), userAgent: navigator.userAgent.slice(0, 200), createdAt: f.fs.serverTimestamp() });
        track("generate_lead", { service: data.service, county: data.county, attachments: attachments.length });
        $("#refCode").textContent = data.ref;
        $("#waFollow").href = `${WA}?text=${encodeURIComponent(`Hello OM Ltd, I just sent quote request ${data.ref} (${SHORT[data.service]}).`)}`;
        form.hidden = true; $("#quoteSuccess").classList.add("on"); $(".wz-steps", wizard).hidden = true;
        try { sessionStorage.removeItem("om-enquiry-list"); } catch {}
      } catch (err) { console.error("[OM] quote save failed", err); say("We couldn't send this online — your email app will open with everything filled in.", "error"); location.href = mailto(data); }
    } else { say("Opening your email app with your request ready to send…"); track("generate_lead", { service: data.service, method: "email" }); location.href = mailto(data); }
    submit.disabled = false; submit.classList.remove("loading");
  });
  $("#newQuote").addEventListener("click", () => {
    form.reset(); files = []; renderFiles(); coords = null; scopeFor = ""; marker?.remove(); marker = null; prog.classList.remove("on");
    form.hidden = false; $("#quoteSuccess").classList.remove("on"); $(".wz-steps", wizard).hidden = false; show(1);
  });
}
