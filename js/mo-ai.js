// =============================================================
// Mo AI — OM Ltd's robot assistant
// Cloud brain: Firebase AI Logic (Gemini) when enabled in firebase-config.js
// Offline brain: built-in OM knowledge base (always available as fallback)
// =============================================================
import { aiModel, track, remoteConfig } from "./firebase.js";

const WA = "https://wa.me/254714995749";
const EMAIL = "oandmlimited@gmail.com";

const SERVICES = {
  plumbing: "Plumbing installation solutions",
  irrigation: "Irrigation and farm supplies",
  tanks: "Greenhouse, tanks and drainage",
  workwear: "Workwear and safety equipment",
  merch: "Branded merchandise",
  other: "Multiple services / Other enquiry"
};

// ---------------------------------------------------------------- system prompt (cloud)
export const SYSTEM_PROMPT = `You are "Mo", the friendly robot assistant for OM Ltd (tagline: "Flowing Solutions for Every Project"; "Quality Water Solutions"), a Kenyan company.
OM Ltd offers:
1) Plumbing installation: sinks, taps, faucets, toilets, bathroom fittings, pipework, drainage, water heaters.
2) Irrigation & farm supplies: drip irrigation, sprinkler systems, water pipes & fittings (HDPE/PVC), water pumps, irrigation controllers, garden hoses & accessories, fertilizers & farm inputs, expert installation & support.
3) Greenhouses, water storage tanks and drainage (pipes, channels, fittings).
4) Workwear & safety (PPE): coveralls, hi-vis safety vests, branded polo shirts, hi-vis jackets, safety boots, hard hats, safety glasses, gloves.
5) Branded merchandise: OM Smart Backpack (fits 15.6" laptop, USB charging port, water resistant, anti-theft pocket, luggage strap, breathable back panel, premium polyester, 20–35 L, 45×32×18 cm, 1.0 kg, 1-year limited warranty; colours Stealth Black, Midnight Blue, Forest Green, Graphite Grey, Arctic White, Cyber Lime limited edition), OM Premium Notebook (PU leather, A5 14.5×21 cm, 192 lined 100 GSM ivory pages, lay-flat binding, elastic closure, pen loop, ribbon bookmark, expandable back pocket; colours Midnight Black, Forest Green, Ocean Blue, Stone Grey, Arctic White), and custom logo merchandise for companies and events.
Sectors: residential, commercial, industrial, agricultural.
Contacts: email ${EMAIL}, WhatsApp +254 714 995 749. Socials: X @OMlimiteds, Instagram @om.limiteds, TikTok @om.limited.
Founders: John Senteu, Dickson Monyatet, Ian Ombui, Isaiah Okara.
Rules:
- Be warm, concise (under 130 words), practical. Use short paragraphs or "- " bullet lists and **bold** sparingly. No headings.
- Reply in the user's language (English or Kiswahili).
- NEVER invent prices, stock levels, delivery times, office addresses, opening hours or certifications. Say the OM team confirms these in a quotation.
- Give genuinely useful general guidance (e.g. drip vs sprinkler, what PPE a crew needs, what details a plumber needs), then guide the user to a quotation.
- Ask at most one clarifying question when needed.
- When a quotation makes sense, end with an action tag on its own line: [[quote:<service>]] where <service> is exactly one of: ${Object.values(SERVICES).join(" | ")}.
- Other available action tags: [[whatsapp]] to offer WhatsApp, [[shop]] to open the merch shop. Use at most two tags.
- Off-topic requests: politely steer back to OM's products and services.`;

// ---------------------------------------------------------------- offline brain
const KB = [
  { id: "greet", k: ["hi", "hello", "hey", "habari", "jambo", "mambo", "sasa", "niaje", "good morning", "good evening", "hujambo"],
    en: () => `Hello! 👋 I'm **Mo**, OM Ltd's robot assistant. I can help with:\n- Plumbing installation\n- Irrigation & farm supplies\n- Tanks, greenhouses & drainage\n- Workwear & safety gear\n- OM backpacks, notebooks & branded merch\n\nWhat are you working on?`,
    sw: () => `Habari! 👋 Mimi ni **Mo**, msaidizi wa OM Ltd. Naweza kukusaidia na:\n- Ufungaji wa mabomba (plumbing)\n- Umwagiliaji na vifaa vya shamba\n- Matangi, greenhouse na mifereji\n- Mavazi ya kazi na usalama\n- Begi, daftari na bidhaa zenye nembo ya OM\n\nUnafanya mradi gani?` },

  { id: "irrigation", k: ["irrigat", "drip", "sprinkler", "farm", "shamba", "acre", "ekari", "crop", "mimea", "umwagiliaji", "greenhouse veg", "tomato", "nyanya", "onion", "kitunguu", "maize", "mahindi", "vegetable", "mboga", "kale", "sukuma", "water my", "garden", "bustani", "hose", "controller", "timer", "fertil", "mbolea", "inputs"],
    en: (t) => {
      const acre = /(\d+(\.\d+)?)\s*(acre|ekari)/i.exec(t);
      const size = acre ? `For **${acre[1]} acre${acre[1] === "1" ? "" : "s"}**, ` : "";
      return `${size}here's how OM usually helps farmers choose:\n- **Drip irrigation** — best for row crops (tomatoes, onions, kale, peppers) and greenhouses; uses far less water and cuts weeds.\n- **Sprinklers** — good for leafy crops, pasture, lawns and nurseries where you need even coverage.\n- **Pump + pipes** — sized to your water source (borehole, tank, river) and how far/high the water travels.\n- **Controller/timer** — automates watering and saves labour.\n\nTo price it, OM needs: crop, field size & shape, water source and distance. Want me to start a quotation?\n[[quote:${SERVICES.irrigation}]]`;
    },
    sw: () => `Kwa umwagiliaji, OM husaidia hivi:\n- **Drip** — bora kwa nyanya, vitunguu, sukuma na greenhouse; huokoa maji.\n- **Sprinkler** — nzuri kwa mboga za majani, malisho na bustani.\n- **Pampu na mabomba** — kulingana na chanzo cha maji (kisima, tangi, mto).\n- **Timer/controller** — hupunguza kazi.\n\nTutumie zao, ukubwa wa shamba na chanzo cha maji ili tukupe bei.\n[[quote:${SERVICES.irrigation}]]` },

  { id: "pump", k: ["pump", "pampu", "borehole", "kisima", "pressure", "head", "lift"],
    en: () => `Choosing a **water pump** depends on three things:\n- **Source** — borehole (submersible), tank or river (surface pump)\n- **Total head** — how high the water is lifted plus pipe-run losses\n- **Flow** — litres per hour your drip/sprinkler system or house needs\n\nShare those (even rough numbers) and OM will recommend and quote the right pump with fittings.\n[[quote:${SERVICES.irrigation}]]`,
    sw: () => `Kuchagua **pampu ya maji** kunategemea:\n- **Chanzo** — kisima (submersible), tangi au mto (surface pump)\n- **Urefu** — maji yanapandishwa juu kiasi gani na umbali wa bomba\n- **Kiasi cha maji** — lita kwa saa unazohitaji\n\nTutumie maelezo hayo na OM itakupendekezea pampu sahihi pamoja na bei.\n[[quote:${SERVICES.irrigation}]]` },

  { id: "plumbing", k: ["plumb", "fundi", "bomba", "pipe", "tap", "faucet", "sink", "toilet", "choo", "bathroom", "bafu", "shower", "leak", "kuvuja", "water heater", "heater", "kitchen", "jikoni", "install", "fitting", "drain block"],
    en: () => `OM handles **plumbing installation** for homes, offices and new builds:\n- Sinks, taps & faucets\n- Toilets & bathroom fittings\n- Pipework, drainage & water heaters\n\n💡 Tip: send photos of the space, the number of fixtures, and whether it's new-build or a replacement — it makes the quotation much faster. You can attach photos to the quote form.\n[[quote:${SERVICES.plumbing}]]`,
    sw: () => `OM hufanya **ufungaji wa mabomba** kwa nyumba na biashara: sinki, bomba, vyoo, bafu, mifereji na hita za maji. Tuma picha za eneo na idadi ya vifaa ili tukupe bei haraka.\n[[quote:${SERVICES.plumbing}]]` },

  { id: "tanks", k: ["tank", "tangi", "storage", "drainage", "mfereji", "greenhouse", "rain", "mvua", "harvest", "gutter", "channel", "septic"],
    en: () => `For **tanks, greenhouses & drainage**, OM supplies:\n- Water storage & drainage tanks\n- Greenhouse structures and accessories\n- Drainage pipes, channels & fittings\n\n💡 Sizing a tank: estimate daily use (a household often uses a few hundred litres a day; drip farms much more) × the days you want in reserve. Tell OM your use and site, and we'll recommend a size.\n[[quote:${SERVICES.tanks}]]` },

  { id: "workwear", k: ["ppe", "safety", "usalama", "workwear", "coverall", "overall", "vest", "reflect", "hi-vis", "hi vis", "boot", "buti", "helmet", "hard hat", "kofia", "glove", "glasses", "goggles", "crew", "uniform", "sare", "construction", "ujenzi", "polo", "jacket"],
    en: (t) => {
      const n = /(\d+)\s*(people|person|staff|workers|crew|men|wafanyakazi)/i.exec(t);
      const crew = n ? `For a crew of **${n[1]}**, a solid starter kit per person is:` : `A solid site kit per person is:`;
      return `${crew}\n- Coverall or hi-vis jacket\n- Reflective safety vest\n- Safety boots (steel toe)\n- Hard hat, safety glasses & gloves\n\nOM can brand coveralls, polos and jackets with your logo. Send sizes and quantities for a team quote.\n[[quote:${SERVICES.workwear}]]`;
    },
    sw: () => `Kwa usalama kazini, kila mfanyakazi anahitaji: overall au jaketi ya kuakisi, vest ya kuakisi, buti za usalama, kofia ngumu, miwani na glovu. OM inaweza kuweka nembo yako. Tuma idadi na saizi.\n[[quote:${SERVICES.workwear}]]` },

  { id: "backpack", k: ["backpack", "bag", "begi", "laptop bag", "usb"],
    en: () => `The **OM Smart Backpack** 🎒\n- Fits 15.6" laptops (padded compartment)\n- Built-in USB charging port\n- Water-resistant premium polyester, 20–35 L\n- Anti-theft pocket, luggage strap, breathable back\n- 45 × 32 × 18 cm · 1.0 kg · 1-year limited warranty\n\nColours: Stealth Black, Midnight Blue, Forest Green, Graphite Grey, Arctic White and **Cyber Lime (limited edition)**.\n[[shop]]\n[[quote:${SERVICES.merch}]]` },

  { id: "notebook", k: ["notebook", "daftari", "journal", "diary", "planner", "stationery"],
    en: () => `The **OM Premium Notebook** 📓\n- PU-leather cover with embossed OM logo\n- A5 (14.5 × 21 cm), 192 lined pages, 100 GSM ivory paper\n- Lay-flat binding, elastic closure, pen loop, ribbon bookmark\n- Expandable back pocket & card slot\n\nColours: Midnight Black, Forest Green, Ocean Blue, Stone Grey, Arctic White. Great for corporate gifting!\n[[shop]]\n[[quote:${SERVICES.merch}]]` },

  { id: "merch", k: ["merch", "branded", "logo", "nembo", "gift", "zawadi", "corporate", "promo", "event", "bottle", "t-shirt", "tshirt", "cap"],
    en: () => `OM makes **branded merchandise** for teams, schools and events:\n- OM Smart Backpacks (6 colours)\n- Premium notebooks (5 colours)\n- Branded polos, jackets & workwear\n- Custom logo items for gifting\n\nTell OM the item, quantity, your logo and deadline and we'll quote.\n[[shop]]\n[[quote:${SERVICES.merch}]]` },

  { id: "price", k: ["price", "bei", "cost", "how much", "pesa", "ngapi", "kiasi", "charge", "budget", "cheap", "rate", "discount"],
    en: () => `Prices depend on quantities, specs and your site, so I won't guess a number 🙂. The OM team sends a **tailored quotation** — usually the fastest way is the quote form (you can attach photos) or WhatsApp.\n[[quote:${SERVICES.other}]]\n[[whatsapp]]`,
    sw: () => `Bei inategemea idadi, vipimo na eneo lako, kwa hivyo sitakisia. Timu ya OM itakutumia **nukuu (quotation)** — jaza fomu au tuongee WhatsApp.\n[[quote:${SERVICES.other}]]\n[[whatsapp]]` },

  { id: "contact", k: ["contact", "call", "phone", "simu", "email", "whatsapp", "reach", "talk to", "human", "person", "agent", "wasiliana", "number", "namba"],
    en: () => `You can reach the OM team here:\n- 💬 WhatsApp: **+254 714 995 749**\n- ✉️ Email: [${EMAIL}](mailto:${EMAIL})\n- 📱 X @OMlimiteds · Instagram @om.limiteds · TikTok @om.limited\n[[whatsapp]]`,
    sw: () => `Wasiliana na OM:\n- 💬 WhatsApp: **+254 714 995 749**\n- ✉️ Barua pepe: [${EMAIL}](mailto:${EMAIL})\n[[whatsapp]]` },

  { id: "location", k: ["where", "location", "wapi", "located", "office", "deliver", "delivery", "county", "nairobi", "nakuru", "mombasa", "kisumu", "eldoret", "kenya"],
    en: () => `OM serves homes, farms and businesses across **Kenya**. For your exact location, delivery and installation timing, the team confirms details in your quotation — just add your town in the form.\n[[quote:${SERVICES.other}]]` },

  { id: "founders", k: ["founder", "owner", "who runs", "who owns", "team", "ceo", "mwanzilishi", "about om", "about you", "company"],
    en: () => `OM Ltd was founded by **John Senteu, Dickson Monyatet, Ian Ombui and Isaiah Okara**. Our promise: quality guaranteed, a trusted partner, and dedicated support. Build · Flow · Thrive 💧` },

  { id: "quote", k: ["quote", "quotation", "nukuu", "order", "buy", "nunua", "purchase", "agiza", "need", "nahitaji", "want"],
    en: () => `Happy to get that started! Which best fits?\n- Plumbing installation\n- Irrigation & farm\n- Tanks & drainage\n- Workwear & safety\n- Branded merch\n\nOr tap below and pick in the form.\n[[quote:${SERVICES.other}]]` },

  { id: "thanks", k: ["thank", "asante", "shukran", "great", "awesome", "nice", "poa", "sawa", "ok", "okay", "cool"],
    en: () => `You're welcome! 💧 Anything else I can help you with?`, sw: () => `Karibu sana! 💧 Kuna kitu kingine naweza kukusaidia?` },

  { id: "robot", k: ["are you a robot", "are you ai", "who are you", "what are you", "your name", "jina lako", "wewe ni nani"],
    en: () => `I'm **Mo** 🤖 — OM Ltd's robot assistant. I know OM's products and can help you plan and start a quotation 24/7. For final prices and stock, the human OM team takes over.` }
];

const SW_HINT = /\b(habari|jambo|mambo|sasa|niaje|nataka|nahitaji|bei|ngapi|shamba|mabomba|bomba|tangi|asante|karibu|tafadhali|naomba|wewe|mimi|kwa|ya|na|ni)\b/i;

function offlineReply(text) {
  const t = text.toLowerCase();
  const sw = SW_HINT.test(t) && (t.match(SW_HINT) || []).length > 0 && /\b(habari|jambo|nataka|nahitaji|bei|ngapi|shamba|asante|tafadhali|naomba|mabomba|wewe|mimi|niaje|mambo|sasa)\b/i.test(t);
  let best = null, score = 0;
  for (const it of KB) {
    let s = 0;
    for (const k of it.k) if (t.includes(k)) s += k.length > 4 ? 2 : 1;
    if (it.id === "greet" && t.split(/\s+/).length > 4) s *= 0.4;      // greetings inside longer questions matter less
    if (it.id === "thanks" && t.split(/\s+/).length > 5) s *= 0.3;
    if (it.id === "quote") s *= 0.6;                                    // generic intent — let specific topics win
    if (s > score) { score = s; best = it; }
  }
  if (!best) {
    return sw
      ? `Samahani, sijaelewa vizuri 🤔. Naweza kusaidia na mabomba, umwagiliaji, matangi, mavazi ya usalama au bidhaa za OM. Au ongea na timu moja kwa moja.\n[[whatsapp]]`
      : `I'm not sure I caught that 🤔. I'm best at plumbing, irrigation, tanks & drainage, workwear/PPE and OM merch. Could you tell me a bit more about your project — or chat with the team directly?\n[[whatsapp]]\n[[quote:${SERVICES.other}]]`;
  }
  return (sw && best.sw ? best.sw : best.en)(text);
}

// ---------------------------------------------------------------- rendering helpers
const esc = s => s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
function md(text) {
  const lines = esc(text.trim()).split(/\n/);
  let html = "", inList = false;
  const inline = s => s
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\(((?:https?:\/\/|mailto:|\/|#)[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  for (const raw of lines) {
    const line = raw.trim();
    if (/^[-•*]\s+/.test(line)) { if (!inList) { html += "<ul>"; inList = true; } html += `<li>${inline(line.replace(/^[-•*]\s+/, ""))}</li>`; continue; }
    if (inList) { html += "</ul>"; inList = false; }
    if (line) html += `<p>${inline(line)}</p>`;
  }
  if (inList) html += "</ul>";
  return html;
}
function splitActions(text) {
  const actions = [];
  const clean = text.replace(/\[\[(quote|whatsapp|shop)(?::([^\]]+))?\]\]/gi, (_, type, arg) => { actions.push({ type: type.toLowerCase(), arg: arg?.trim() }); return ""; });
  return { clean: clean.replace(/\n{3,}/g, "\n\n"), actions: actions.slice(0, 3) };
}

// ---------------------------------------------------------------- widget
export function initMo() {
  const panel = document.getElementById("moPanel");
  if (!panel) return;
  const body = document.getElementById("moBody");
  const form = document.getElementById("moForm");
  const input = document.getElementById("moText");
  const sendBtn = form.querySelector(".mo-send");
  const suggest = document.getElementById("moSuggest");
  const modeEl = document.getElementById("moMode");
  const bots = () => document.querySelectorAll(".mo-bot");

  const STORE = "om-mo-history-v2";
  let history = [];
  try { history = JSON.parse(sessionStorage.getItem(STORE) || "[]"); } catch {}
  const save = () => { try { sessionStorage.setItem(STORE, JSON.stringify(history.slice(-30))); } catch {} };

  let chat = null, cloudTried = false, busy = false;
  async function getChat() {
    if (cloudTried) return chat;
    cloudTried = true;
    try {
      const model = await aiModel(SYSTEM_PROMPT);
      if (model) {
        chat = model.startChat({ history: history.slice(-12).map(m => ({ role: m.role === "user" ? "user" : "model", parts: [{ text: m.text }] })) });
        modeEl.textContent = "Online · Gemini-powered";
      }
    } catch (e) { console.warn("[OM] Mo cloud brain unavailable, using offline brain.", e); }
    return chat;
  }

  const SUGGESTIONS = ["💧 Irrigate my farm", "🚿 Bathroom plumbing", "🦺 PPE for my crew", "🎒 OM backpack colours", "💰 How do prices work?", "📞 Contact the team"];
  suggest.innerHTML = SUGGESTIONS.map(s => `<button type="button" class="chip">${s}</button>`).join("");
  suggest.addEventListener("click", e => { const b = e.target.closest(".chip"); if (b) ask(b.textContent.replace(/^\S+\s/, "")); });

  function scroll() { body.scrollTop = body.scrollHeight; }
  function bubble(role, text, { actions = [] } = {}) {
    const el = document.createElement("div");
    el.className = `msg ${role === "user" ? "user" : "bot"}`;
    if (role === "user") el.textContent = text; else el.innerHTML = md(text);
    if (actions.length) el.appendChild(actionRow(actions));
    body.appendChild(el); scroll();
    return el;
  }
  function actionRow(actions) {
    const row = document.createElement("div");
    row.className = "msg-actions";
    for (const a of actions) {
      const b = document.createElement(a.type === "quote" ? "button" : "a");
      if (a.type === "quote") { b.className = "btn btn-lime"; b.textContent = "Start my quotation →"; b.type = "button"; b.onclick = () => startQuote(a.arg); }
      if (a.type === "whatsapp") { b.className = "btn btn-glass"; b.textContent = "WhatsApp the team"; b.href = `${WA}?text=${encodeURIComponent("Hello OM Ltd, I was chatting with Mo AI and would like help with: " + (lastUserText() || "an enquiry"))}`; b.target = "_blank"; b.rel = "noopener"; }
      if (a.type === "shop") { b.className = "btn btn-glass"; b.textContent = "Open the shop"; b.href = "merch.html"; }
      row.appendChild(b);
    }
    return row;
  }
  const lastUserText = () => [...history].reverse().find(m => m.role === "user")?.text || "";

  function startQuote(service) {
    const valid = Object.values(SERVICES);
    const svc = valid.find(v => v.toLowerCase() === String(service || "").toLowerCase()) || SERVICES.other;
    const notes = history.filter(m => m.role === "user").slice(-3).map(m => `• ${m.text}`).join("\n");
    const details = notes ? `From my chat with Mo AI:\n${notes}` : "";
    track("mo_ai_quote_start", { service: svc });
    const select = document.getElementById("serviceSelect");
    if (select) {
      select.value = svc;
      const ta = document.querySelector('#quoteForm textarea[name="details"]');
      if (ta && !ta.value.trim()) ta.value = details;
      close();
      document.getElementById("quote")?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => document.querySelector('#quoteForm input[name="name"]')?.focus({ preventScroll: true }), 700);
    } else {
      try { sessionStorage.setItem("om-service", svc); sessionStorage.setItem("om-details", details); } catch {}
      location.href = "index.html#quote";
    }
  }

  function typing() {
    const el = document.createElement("div");
    el.className = "msg bot"; el.innerHTML = '<span class="typing"><span></span><span></span><span></span></span>';
    body.appendChild(el); scroll(); return el;
  }
  const talk = on => bots().forEach(b => b.classList.toggle("talking", on));

  async function ask(text) {
    text = text.trim();
    if (!text || busy) return;
    busy = true; sendBtn.disabled = true;
    bubble("user", text);
    history.push({ role: "user", text }); save();
    track("mo_ai_message", { mode: chat ? "cloud" : "offline" });
    const tEl = typing(); talk(true);
    let reply = "";
    try {
      const c = await getChat();
      if (c) {
        const result = await c.sendMessageStream(text);
        let el = null;
        for await (const chunk of result.stream) {
          reply += chunk.text();
          if (!el) { tEl.remove(); el = bubble("bot", ""); }
          el.innerHTML = md(splitActions(reply).clean.replace(/\[\[[^\]]*$/, ""));
          scroll();
        }
        const { clean, actions } = splitActions(reply);
        if (el) { el.innerHTML = md(clean); if (actions.length) el.appendChild(actionRow(actions)); }
        else { tEl.remove(); bubble("bot", clean, { actions }); }
      } else throw new Error("offline");
    } catch (e) {
      if (e.message !== "offline") console.warn("[OM] Mo cloud error, falling back:", e);
      await new Promise(r => setTimeout(r, 450 + Math.random() * 500));
      reply = offlineReply(text);
      tEl.remove();
      const { clean, actions } = splitActions(reply);
      bubble("bot", clean, { actions });
    }
    history.push({ role: "model", text: reply }); save();
    talk(false); busy = false; sendBtn.disabled = false;
  }

  async function greet() {
    let g = "";
    try { const rc = await remoteConfig(); g = rc?.string("mo_ai_greeting") || ""; } catch {}
    const text = g || `Hi! I'm **Mo** 🤖💧 — OM Ltd's robot assistant.\nTell me about your project (farm, home, worksite or team merch) and I'll point you to the right solution and start your quotation. I speak English & Kiswahili.`;
    bubble("bot", text);
  }

  function render() {
    body.innerHTML = "";
    if (!history.length) return greet();
    for (const m of history) {
      if (m.role === "user") bubble("user", m.text);
      else { const { clean, actions } = splitActions(m.text); bubble("bot", clean, { actions }); }
    }
  }

  let rendered = false, lastFocus = null;
  function open(prefill) {
    if (!rendered) { render(); rendered = true; }
    lastFocus = document.activeElement;
    document.body.classList.add("mo-open");
    document.querySelector(".mo-launcher-tip")?.classList.add("gone");
    try { localStorage.setItem("om-mo-seen", "1"); } catch {}
    track("mo_ai_open");
    setTimeout(() => input.focus(), 350);
    if (prefill) setTimeout(() => ask(prefill), 500);
  }
  function close() { document.body.classList.remove("mo-open"); lastFocus?.focus?.({ preventScroll: true }); }

  document.addEventListener("click", e => {
    const t = e.target.closest("[data-mo-open]");
    if (!t) return;
    e.preventDefault();
    open(t.dataset.moAsk);
  });
  document.getElementById("moClose").addEventListener("click", close);
  document.getElementById("moReset").addEventListener("click", () => { history = []; save(); chat = null; cloudTried = false; body.innerHTML = ""; greet(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && document.body.classList.contains("mo-open")) close(); });

  form.addEventListener("submit", e => { e.preventDefault(); const v = input.value; input.value = ""; input.style.height = ""; ask(v); });
  input.addEventListener("keydown", e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); } });
  input.addEventListener("input", () => { input.style.height = "auto"; input.style.height = Math.min(input.scrollHeight, 120) + "px"; });

  try { if (localStorage.getItem("om-mo-seen")) document.querySelector(".mo-launcher-tip")?.classList.add("gone"); } catch {}

  return { open, close, ask };
}

// exported for tests
export const _offlineReply = offlineReply;
