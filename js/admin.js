// =============================================================
// OM Ltd — team dashboard (Firebase Auth + Firestore + Storage)
// Access: Google sign-in, then a document must exist at admins/{uid}.
// Newsletters are delivered by the "Trigger Email from Firestore" extension,
// which watches the `mail` collection.
// =============================================================
import { isConfigured, auth, firestore, storage, track } from "./firebase.js";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmt = ts => ts?.toDate ? ts.toDate().toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" }) : "—";
const msg = $("#adminMsg"), login = $("#adminLogin"), appEl = $("#adminApp");

let quotes = [], subs = [], unsubs = new Set(), user = null;

if (!isConfigured) {
  msg.innerHTML = "Firebase isn't connected yet. Add your project keys to <code>firebase-config.js</code>, enable Google sign-in in Firebase Authentication, then reload.";
  $("#googleSignIn").disabled = true;
} else init();

async function init() {
  const a = await auth(); const f = await firestore();
  if (!a || !f) { msg.textContent = "Couldn't load Firebase. Check your connection and config."; return; }
  const { au, auth: authInst } = a; const { fs, db } = f;

  $("#googleSignIn").addEventListener("click", async () => {
    try { await au.signInWithPopup(authInst, new au.GoogleAuthProvider()); }
    catch (e) { msg.textContent = "Sign-in failed: " + (e.code || e.message); }
  });
  $("#signOut").addEventListener("click", () => au.signOut(authInst));

  au.onAuthStateChanged(authInst, async u => {
    user = u;
    if (!u) { login.hidden = false; appEl.hidden = true; return; }
    const isAdmin = await fs.getDoc(fs.doc(db, "admins", u.uid)).then(d => d.exists()).catch(() => false);
    if (!isAdmin) {
      login.hidden = false; appEl.hidden = true;
      msg.innerHTML = `Signed in as <b>${esc(u.email)}</b>, but this account isn't on the OM team list yet.<br><br>Ask the site owner to create a Firestore document at <code>admins/${esc(u.uid)}</code> (any fields), then reload.`;
      $("#googleSignIn").textContent = "Sign out"; $("#googleSignIn").onclick = () => au.signOut(authInst);
      return;
    }
    login.hidden = true; appEl.hidden = false;
    $("#adminName").textContent = (u.displayName || u.email).split(" ")[0];
    track("admin_login");
    start(fs, db);
  });
}

function start(fs, db) {
  // tabs
  const tabs = $$("[data-admin-tab]");
  tabs.forEach(t => t.addEventListener("click", () => {
    tabs.forEach(x => x.setAttribute("aria-selected", String(x === t)));
    $$("[data-admin-panel]").forEach(p => p.hidden = p.dataset.adminPanel !== t.dataset.adminTab);
    if (t.dataset.adminTab === "compose") updatePreview();
  }));

  // quotations (live)
  fs.onSnapshot(fs.query(fs.collection(db, "quotationRequests"), fs.orderBy("createdAt", "desc"), fs.limit(300)), snap => {
    quotes = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    $("#kTotal").textContent = quotes.length;
    $("#kNew").textContent = quotes.filter(q => q.status === "new").length;
    $("#quotesBody").innerHTML = quotes.length ? quotes.map(q => `
      <tr><td>${fmt(q.createdAt)}</td><td><code>${esc(q.ref || q.id.slice(0, 6))}</code></td>
      <td><b>${esc(q.name)}</b>${q.company ? `<br><small class="muted">${esc(q.company)}</small>` : ""}${q.email ? `<br><a href="mailto:${esc(q.email)}">${esc(q.email)}</a>` : ""}<br><a href="https://wa.me/${esc(String(q.phone).replace(/\D/g, "").replace(/^0/, "254"))}" target="_blank" rel="noopener">${esc(q.phone)}</a></td>
      <td>${esc(q.service)}${q.location || q.county ? `<br><small class="muted">📍 ${esc(q.location || q.county)}</small>` : ""}${q.coords ? `<br><a href="https://www.openstreetmap.org/?mlat=${+q.coords.lat}&mlon=${+q.coords.lng}#map=15/${+q.coords.lat}/${+q.coords.lng}" target="_blank" rel="noopener">View on map</a>` : ""}${q.budget ? `<br><small class="muted">💰 ${esc(q.budget)}</small>` : ""}</td>
      <td style="max-width:320px;white-space:pre-wrap">${esc(q.details)}</td>
      <td>${(q.attachments || []).map((a, i) => `<a href="#" data-file="${esc(a.path)}">📎 ${esc(a.name || "file " + (i + 1))}</a>`).join("<br>") || "—"}</td>
      <td><span class="pill ${esc(q.status)}">${esc(q.status)}</span><br><select class="mini-select" data-status="${q.id}" aria-label="Update status">${["new", "contacted", "won", "closed"].map(s => `<option${s === q.status ? " selected" : ""}>${s}</option>`).join("")}</select></td></tr>`).join("")
      : `<tr><td colspan="7" class="muted">No quotation requests yet.</td></tr>`;
  }, e => $("#quotesBody").innerHTML = `<tr><td colspan="7">Error: ${esc(e.message)}</td></tr>`);

  document.addEventListener("change", async e => {
    const s = e.target.closest("[data-status]"); if (!s) return;
    await fs.updateDoc(fs.doc(db, "quotationRequests", s.dataset.status), { status: s.value, updatedAt: fs.serverTimestamp(), updatedBy: user.email });
  });
  document.addEventListener("click", async e => {
    const a = e.target.closest("[data-file]"); if (!a) return;
    e.preventDefault();
    const st = await storage(); if (!st) return;
    window.open(await st.st.getDownloadURL(st.st.ref(st.storage, a.dataset.file)), "_blank", "noopener");
  });

  // human-mode chats (live)
  const waNum = p => String(p).replace(/\D/g, "").replace(/^0/, "254");
  fs.onSnapshot(fs.query(fs.collection(db, "liveChats"), fs.orderBy("createdAt", "desc"), fs.limit(300)), snap => {
    const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    $("#kChats").textContent = rows.filter(r => r.status === "new").length;
    $("#chatsBody").innerHTML = rows.length ? rows.map(r => `<tr><td>${fmt(r.createdAt)}</td><td><b>${esc(r.name)}</b><br>${esc(r.phone)}</td>
      <td style="max-width:340px;white-space:pre-wrap">${esc(r.message)}</td><td style="max-width:220px"><small class="muted">${esc(r.context || "—")}</small></td>
      <td><span class="pill ${esc(r.status)}">${esc(r.status)}</span><br><select class="mini-select" data-chat-status="${r.id}" aria-label="Update status">${["new", "contacted", "closed"].map(s => `<option${s === r.status ? " selected" : ""}>${s}</option>`).join("")}</select></td>
      <td><a class="btn btn-primary btn-sm" target="_blank" rel="noopener" href="https://wa.me/${waNum(r.phone)}?text=${encodeURIComponent(`Hello ${r.name}, this is the OM Ltd team replying to your message: "${String(r.message).slice(0, 120)}"`)}">Reply on WhatsApp</a></td></tr>`).join("")
      : `<tr><td colspan="6" class="muted">No messages yet — they appear here when visitors use “Talk to a human” in OM AI.</td></tr>`;
  });
  document.addEventListener("change", async e => {
    const s = e.target.closest("[data-chat-status]"); if (!s) return;
    await fs.updateDoc(fs.doc(db, "liveChats", s.dataset.chatStatus), { status: s.value, updatedAt: fs.serverTimestamp(), updatedBy: user.email });
  });

  // reviews (live)
  fs.onSnapshot(fs.query(fs.collection(db, "testimonials"), fs.orderBy("createdAt", "desc"), fs.limit(200)), snap => {
    const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    $("#kReviews").textContent = rows.filter(r => !r.approved).length;
    $("#reviewsBody").innerHTML = rows.length ? rows.map(r => `<tr><td>${fmt(r.createdAt)}</td><td><b>${esc(r.name)}</b><br><small class="muted">${esc([r.org, r.service].filter(Boolean).join(" · "))}</small></td>
      <td style="color:var(--amber-400)">${"★".repeat(r.rating || 0)}</td><td style="max-width:380px">${esc(r.message)}</td>
      <td><span class="pill ${r.approved ? "won" : "new"}">${r.approved ? "published" : "pending"}</span></td>
      <td><button class="btn btn-glass btn-sm" data-approve="${r.id}" data-to="${!r.approved}">${r.approved ? "Unpublish" : "Approve"}</button> <button class="btn btn-glass btn-sm" data-del-review="${r.id}">Delete</button></td></tr>`).join("")
      : `<tr><td colspan="6" class="muted">No reviews yet.</td></tr>`;
  });
  document.addEventListener("click", async e => {
    const ap = e.target.closest("[data-approve]");
    if (ap) await fs.updateDoc(fs.doc(db, "testimonials", ap.dataset.approve), { approved: ap.dataset.to === "true", reviewedBy: user.email, reviewedAt: fs.serverTimestamp() });
    const del = e.target.closest("[data-del-review]");
    if (del && confirm("Delete this review permanently?")) await fs.deleteDoc(fs.doc(db, "testimonials", del.dataset.delReview));
  });

  // subscribers (live) minus unsubscribes
  const renderSubs = () => {
    const seen = new Map();
    for (const s of subs) if (!seen.has(s.email)) seen.set(s.email, s);       // newest first → dedupe
    const list = [...seen.values()];
    const active = list.filter(s => !unsubs.has(s.email));
    $("#kSubs").textContent = active.length;
    $("#subsBody").innerHTML = list.length ? list.map(s => `<tr><td>${fmt(s.createdAt)}</td><td>${esc(s.email)}</td><td>${esc(s.name || "—")}</td><td>${esc((s.interests || []).join(", ") || "—")}</td><td><span class="pill ${unsubs.has(s.email) ? "closed" : "won"}">${unsubs.has(s.email) ? "unsubscribed" : "active"}</span></td></tr>`).join("")
      : `<tr><td colspan="5" class="muted">No subscribers yet — the signup forms are on the home page, footer and newsletter page.</td></tr>`;
    updateCount();
  };
  fs.onSnapshot(fs.query(fs.collection(db, "newsletterSubscribers"), fs.orderBy("createdAt", "desc"), fs.limit(5000)), snap => { subs = snap.docs.map(d => d.data()); renderSubs(); });
  fs.onSnapshot(fs.collection(db, "newsletterUnsubscribes"), snap => { unsubs = new Set(snap.docs.map(d => String(d.data().email).toLowerCase())); renderSubs(); });

  fs.onSnapshot(fs.query(fs.collection(db, "newsletterCampaigns"), fs.orderBy("createdAt", "desc"), fs.limit(50)), snap => {
    $("#campaignsBody").innerHTML = snap.empty ? `<tr><td colspan="5" class="muted">No campaigns sent yet.</td></tr>` :
      snap.docs.map(d => { const c = d.data(); return `<tr><td>${fmt(c.createdAt)}</td><td>${esc(c.subject)}</td><td>${esc(c.audience)}</td><td>${c.recipients}</td><td>${esc(c.sentBy)}</td></tr>`; }).join("");
  });

  // CSV exports
  const csv = (rows, cols) => [cols.join(","), ...rows.map(r => cols.map(c => `"${String(Array.isArray(r[c]) ? r[c].join("; ") : r[c]?.toDate ? r[c].toDate().toISOString() : r[c] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
  const download = (name, text) => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type: "text/csv" })); a.download = name; a.click(); };
  $("#exportCsv").addEventListener("click", () => download(`om-quotes-${new Date().toISOString().slice(0, 10)}.csv`, csv(quotes.map(q => ({ ...q, map: q.coords ? `${q.coords.lat},${q.coords.lng}` : "" })), ["createdAt", "ref", "status", "name", "company", "email", "phone", "service", "location", "county", "map", "budget", "details"])));
  $("#exportSubs").addEventListener("click", () => download(`om-subscribers-${new Date().toISOString().slice(0, 10)}.csv`, csv(audience("all"), ["createdAt", "email", "name", "interests"])));

  // ---------------- newsletter composer
  const form = $("#composeForm"), status = $("#composeStatus");
  const audience = key => {
    const seen = new Map();
    for (const s of subs) if (!seen.has(s.email) && !unsubs.has(s.email) && s.status !== "unsubscribed") seen.set(s.email, s);
    const all = [...seen.values()];
    return key === "all" ? all : all.filter(s => (s.interests || []).includes(key));
  };
  function updateCount() { if (form) $("#audienceCount").textContent = `${audience(form.audience.value).length} recipient(s)`; }

  function emailHtml({ headline, body, ctaText, ctaUrl }, email = "subscriber@example.com", name = "") {
    const base = location.origin + location.pathname.replace(/admin(\.html)?$/, "");
    const paras = esc(body).split(/\n{2,}/).map(p => `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#2b3a55">${p.replace(/\n/g, "<br>")}</p>`).join("");
    const cta = ctaText && ctaUrl ? `<p style="margin:24px 0"><a href="${esc(ctaUrl)}" style="display:inline-block;padding:14px 26px;border-radius:999px;background:#1a6bff;color:#fff;font-weight:700;text-decoration:none">${esc(ctaText)}</a></p>` : "";
    return `<!doctype html><html><body style="margin:0;background:#eef3fb;font-family:Arial,Helvetica,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef3fb;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:18px;overflow:hidden">
<tr><td style="background:linear-gradient(120deg,#061336,#0b4fd6);background-color:#0b2a7a;padding:28px 32px"><img src="${base}assets/om-mark.png" width="64" alt="OM Ltd" style="display:block;margin-bottom:10px;background:#00208b;border-radius:8px;padding:4px"><div style="color:#7fe5ff;font-size:12px;letter-spacing:2px;font-weight:700">THE OM NEWSLETTER</div><div style="color:#fff;font-size:26px;font-weight:800;margin-top:6px">${esc(headline)}</div></td></tr>
<tr><td style="padding:28px 32px">${name ? `<p style="margin:0 0 16px;font-size:16px;color:#2b3a55">Hi ${esc(name)},</p>` : ""}${paras}${cta}</td></tr>
<tr><td style="padding:20px 32px;background:#f5f8fe;font-size:12px;color:#7187ad;line-height:1.6">OM Ltd · Quality Water Solutions · Build · Flow · Thrive<br>WhatsApp +254 714 995 749 · oandmlimited@gmail.com<br>
You're receiving this because you subscribed at our website. <a href="${base}newsletter.html?email=${encodeURIComponent(email)}#unsubscribe" style="color:#1a6bff">Unsubscribe</a></td></tr>
</table></td></tr></table></body></html>`;
  }
  const values = () => Object.fromEntries(new FormData(form));
  function updatePreview() {
    const v = values();
    $("#nlPreview").srcdoc = emailHtml({ headline: v.headline || "Your headline here", body: v.body || "Your message will appear here.", ctaText: v.ctaText, ctaUrl: v.ctaUrl }, user?.email, "Jane");
    updateCount();
  }
  form.addEventListener("input", updatePreview);

  async function queue(recipients, v, isTest) {
    const text = `${v.headline}\n\n${v.body}${v.ctaUrl ? `\n\n${v.ctaText || "Learn more"}: ${v.ctaUrl}` : ""}\n\n— OM Ltd`;
    for (let i = 0; i < recipients.length; i += 400) {
      const batch = fs.writeBatch(db);
      for (const r of recipients.slice(i, i + 400)) {
        batch.set(fs.doc(fs.collection(db, "mail")), {
          to: r.email,
          message: { subject: (isTest ? "[TEST] " : "") + v.subject, html: emailHtml(v, r.email, r.name), text },
          campaign: isTest ? "test" : v.subject, createdAt: fs.serverTimestamp(), createdBy: user.email
        });
      }
      await batch.commit();
    }
  }
  $("#sendTest").addEventListener("click", async () => {
    if (!form.reportValidity()) return;
    await queue([{ email: user.email, name: (user.displayName || "").split(" ")[0] }], values(), true);
    status.textContent = `Test queued to ${user.email}. (Requires the Trigger Email extension.)`; status.className = "form-status success";
  });
  form.addEventListener("submit", async e => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const v = values(), list = audience(v.audience);
    if (!list.length) { status.textContent = "No active subscribers in this audience yet."; status.className = "form-status error"; return; }
    if (!confirm(`Send “${v.subject}” to ${list.length} subscriber(s)?`)) return;
    const btn = $("button[type=submit]", form); btn.disabled = true; btn.classList.add("loading");
    try {
      await queue(list, v, false);
      await fs.addDoc(fs.collection(db, "newsletterCampaigns"), { subject: v.subject, headline: v.headline, audience: v.audience, recipients: list.length, sentBy: user.email, createdAt: fs.serverTimestamp() });
      track("newsletter_sent", { recipients: list.length });
      status.textContent = `✅ Queued for ${list.length} subscriber(s). Delivery status appears on each mail document.`; status.className = "form-status success";
      form.reset(); updatePreview();
    } catch (err) { status.textContent = "Couldn't queue the newsletter: " + err.message; status.className = "form-status error"; }
    btn.disabled = false; btn.classList.remove("loading");
  });
  form.audience.addEventListener("change", updateCount);
}
