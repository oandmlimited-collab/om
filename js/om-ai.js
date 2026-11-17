// =============================================================
// OM AI — OM Ltd's assistant, with two modes:
//   • OM AI mode  → instant answers (Firebase AI Logic / Gemini when enabled,
//                   otherwise a built-in English + Kiswahili knowledge base)
//   • Human mode  → the visitor's message goes to the OM team (Firestore
//                   `liveChats`, shown in the dashboard) with WhatsApp fallback
// =============================================================
import { aiModel, track, remoteConfig, firestore } from "./firebase.js";

const WA = "https://wa.me/254714995749";
const EMAIL = "oandmlimited@gmail.com";

const SERVICES = {
  plumbing: "Plumbing installation and repairs",
  irrigation: "Irrigation and farm supplies",
  construction: "Construction and renovation",
  tanks: "Plumbing installation and repairs",
  workwear: "Workwear and safety equipment",
  merch: "Branded merchandise",
  other: "Multiple services / Other enquiry"
};

export const SYSTEM_PROMPT = `You are "OM AI", the automated assistant for OM Ltd (tagline: "Flowing Solutions for Every Project"; "Quality Water Solutions"), a Kenyan company. You are an AI, not a person — say so if asked.
Who OM is: OM installs, repairs and builds for homes, businesses and farms. Plumbers, builders and irrigation specialists work as one team — one point of contact, one schedule and one written quote.
OM offers:
1) Plumbing: leak detection & repair, pipe installation, drainage & sewer, water tanks & pumps, water heaters & solar, bathroom & kitchen fitting.
2) Construction: building construction, renovations & finishing, water & site works, estimates & planning.
3) Irrigation & farm supplies: drip irrigation systems, sprinkler & lawn irrigation, solar pumps & water supply, maintenance & repair; also pipes & fittings (HDPE/PVC), pumps, controllers, hoses, fertilizers & farm inputs.
4) Workwear & safety (PPE): coveralls, hi-vis safety vests, branded polo shirts, hi-vis jackets, safety boots, hard hats, safety glasses, gloves.
5) Branded merchandise: OM Smart Backpack (fits 15.6" laptop, USB charging port, water resistant, anti-theft pocket, luggage strap, breathable back panel, premium polyester, 20–35 L, 45×32×18 cm, 1.0 kg, 1-year limited warranty; colours Stealth Black, Midnight Blue, Forest Green, Graphite Grey, Arctic White, Cyber Lime limited edition), OM Premium Notebook (PU leather, A5, 192 lined 100 GSM pages, lay-flat, elastic closure, pen loop, ribbon bookmark, back pocket; colours Midnight Black, Forest Green, Ocean Blue, Stone Grey, Arctic White), and custom logo merchandise.
Sectors: homes, businesses and farms across Kenya.
Opening hours: Monday–Saturday, 8:00 am – 6:00 pm. Plumbing emergencies: 24 hours (fastest via WhatsApp +254 714 995 749).
How a job runs: 1) tell us what's happening (call, request or WhatsApp photos) 2) we assess the site (a technician inspects and measures) 3) you get a written, itemised quote before work starts 4) we do the work (qualified team, quality materials, tidy site) 5) we test and hand over (pressure- and flow-tested before we leave).
Contacts: email ${EMAIL}, WhatsApp +254 714 995 749. Founders: John Senteu (Managing Director — leads the business); Eng. Dickson Monyatet (engineer); Eng. Ian A. Ombui (engineer — irrigation farming systems and client consultation); Isaiah Okara (plumbing technologist — new technology and modern design).
Rules:
- Be warm, concise (under 120 words), practical. Use short paragraphs or "- " bullets and **bold** sparingly. No headings.
- Reply in the user's language (English or Kiswahili). Farmers may ask in Kiswahili — answer naturally.
- NEVER invent prices, stock levels, delivery times, office addresses or certifications (hours are given above). The OM team confirms these in a quotation.
- Give genuinely useful general guidance, then guide the user to a quotation. Ask at most one clarifying question.
- When a quotation makes sense, end with an action tag on its own line: [[quote:<service>]] where <service> is exactly one of: ${Object.values(SERVICES).join(" | ")}.
- For an active leak, burst pipe or flooding: tell them to shut off the main water valve if safe, and to WhatsApp OM now (24-hour emergencies) — add [[whatsapp]].
- If the user wants a person, is unhappy, or needs something you can't answer, add [[human]]. Other tags: [[whatsapp]], [[shop]]. Use at most two tags.
- Off-topic requests: politely steer back to OM's products and services.`;

// ---------------------------------------------------------------- offline brain
const KB = [
  { id: "greet", k: ["hi", "hello", "hey", "habari", "jambo", "mambo", "sasa", "niaje", "good morning", "good evening", "hujambo"],
    en: () => `Hello! 👋 I'm **OM AI**, OM Ltd's assistant. I can help with:\n- Plumbing installation & repairs\n- Construction & renovation\n- Irrigation, solar pumps & farm supplies\n- Workwear & safety gear\n- OM backpacks, notebooks & branded merch\n\nWhat are you working on?`,
    sw: () => `Habari! 👋 Mimi ni **OM AI**, msaidizi wa OM Ltd. Naweza kukusaidia na:\n- Mabomba (plumbing) na matengenezo\n- Ujenzi na ukarabati\n- Umwagiliaji na pampu za jua\n- Mavazi ya kazi na usalama\n- Begi, daftari na bidhaa zenye nembo ya OM\n\nUnafanya mradi gani?` },

  { id: "emergency", k: ["emergency", "urgent", "burst", "flood", "leaking badly", "leak", "dharura", "haraka", "imepasuka", "inavuja", "no water", "hakuna maji"],
    en: () => `🚨 **Leak or burst pipe?** If it's safe, **turn off the main water valve** (usually near the meter or where the pipe enters the building) and switch off any water heater.\nOM handles **plumbing emergencies 24 hours** — WhatsApp us photos now for the fastest response.\n[[whatsapp]]\n[[quote:${SERVICES.plumbing}]]`,
    sw: () => `🚨 **Bomba limepasuka au linavuja?** Ikiwa ni salama, **funga valvu kuu ya maji** na uzime hita ya maji.\nOM hushughulikia **dharura za mabomba saa 24** — tutumie picha kwa WhatsApp sasa.\n[[whatsapp]]` },

  { id: "construction", k: ["construct", "build a", "building", "house", "nyumba", "renovat", "finishing", "extension", "site works", "foundation", "ujenzi", "jenga", "estimate", "bill of quantities", "boq", "contractor"],
    en: () => `OM's builders and plumbers work as **one team** on:\n- Building construction\n- Renovations & finishing\n- Water & site works\n- Estimates & planning\n\nYou get one point of contact, one schedule and **one written, itemised quote**. A technician visits to assess and measure first. Share your plans or photos to get started.\n[[quote:${SERVICES.construction}]]`,
    sw: () => `Mafundi wa ujenzi na mabomba wa OM hufanya kazi kama **timu moja**: ujenzi wa majengo, ukarabati na finishing, kazi za maji, na makadirio. Utapata **nukuu moja iliyoandikwa**. Tutumie michoro au picha.\n[[quote:${SERVICES.construction}]]` },

  { id: "hours", k: ["hours", "open", "opening", "close", "saa ngapi", "mnafungua", "weekend", "saturday", "sunday", "jumamosi", "jumapili", "working hours", "available"],
    en: () => `OM is open **Monday–Saturday, 8:00 am – 6:00 pm**, and handles **plumbing emergencies 24 hours**. For anything urgent, WhatsApp **+254 714 995 749**.\n[[whatsapp]]`,
    sw: () => `OM iko wazi **Jumatatu–Jumamosi, saa 2 asubuhi – saa 12 jioni**, na dharura za mabomba **saa 24**. WhatsApp **+254 714 995 749**.\n[[whatsapp]]` },

  { id: "process", k: ["how does it work", "process", "steps", "how do you work", "site visit", "inspection", "assess", "warranty", "test", "handover"],
    en: () => `Here's how a job runs with OM:\n- **1.** Tell us what's happening — call, request or WhatsApp photos\n- **2.** We assess the site — a technician inspects and measures\n- **3.** You get a **written, itemised quote** before work starts\n- **4.** We do the work — qualified team, quality materials, tidy site\n- **5.** We **pressure- and flow-test** and hand over\n[[quote:${SERVICES.other}]]` },

  { id: "solar", k: ["solar", "heater", "hot water", "maji moto", "geyser", "jua"],
    en: () => `OM installs **water heaters & solar water heating** and **solar pumps** for farms and homes. To size it, tell us:\n- How many people / outlets need hot water (or your farm's water need)\n- Roof type and space (for solar)\n- Your current water source & tank\n[[quote:${SERVICES.plumbing}]]` },

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

  { id: "plumbing", k: ["plumb", "fundi", "bomba", "pipe", "tap", "faucet", "sink", "toilet", "choo", "bathroom", "bafu", "shower", "water heater", "heater", "kitchen", "jikoni", "install", "fitting", "drain block"],
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
    en: () => `Happy to connect you with the team 👋\n- Switch to **Human mode** and leave a message here\n- 💬 WhatsApp: **+254 714 995 749**\n- ✉️ Email: [${EMAIL}](mailto:${EMAIL})\n[[human]]\n[[whatsapp]]`,
    sw: () => `Wasiliana na OM:\n- 💬 WhatsApp: **+254 714 995 749**\n- ✉️ Barua pepe: [${EMAIL}](mailto:${EMAIL})\n[[whatsapp]]` },

  { id: "location", k: ["where", "location", "wapi", "located", "office", "deliver", "delivery", "county", "nairobi", "nakuru", "mombasa", "kisumu", "eldoret", "kenya"],
    en: () => `OM serves homes, farms and businesses across **Kenya**. For your exact location, delivery and installation timing, the team confirms details in your quotation — just add your town in the form.\n[[quote:${SERVICES.other}]]` },

  { id: "founders", k: ["founder", "owner", "who runs", "who owns", "team", "ceo", "mwanzilishi", "about om", "about you", "company"],
    en: () => `OM Ltd was founded by **John Senteu (Managing Director), Eng. Dickson Monyatet, Eng. Ian A. Ombui and Isaiah Okara**. Eng. Ian Ombui leads irrigation farming systems and client consultations, and Isaiah Okara (plumbing technologist) leads new technology and modern design. Our promise: quality guaranteed, a trusted partner, and dedicated support. Build · Flow · Thrive 💧` },

  { id: "quote", k: ["quote", "quotation", "nukuu", "order", "buy", "nunua", "purchase", "agiza", "need", "nahitaji", "want"],
    en: () => `Happy to get that started! Which best fits?\n- Plumbing\n- Construction\n- Irrigation & farm\n- Workwear & safety\n- Branded merch\n\nOr tap below and pick in the form.\n[[quote:${SERVICES.other}]]` },

  { id: "thanks", k: ["thank", "asante", "shukran", "great", "awesome", "nice", "poa", "sawa", "ok", "okay", "cool"],
    en: () => `You're welcome! 💧 Anything else I can help you with?`, sw: () => `Karibu sana! 💧 Kuna kitu kingine naweza kukusaidia?` },

  { id: "robot", k: ["are you a robot", "are you ai", "are you human", "real person", "mtu halisi", "who are you", "what are you", "your name", "jina lako", "wewe ni nani"],
    en: () => `I'm **OM AI** 💧 — OM Ltd's automated assistant (not a person). I know OM's products and can help you plan and start a quotation 24/7. Want a real person? Switch to **Human mode** and the OM team will reply.\n[[human]]` }
];

const SW_HINT = /\b(habari|jambo|mambo|sasa|niaje|nataka|nahitaji|bei|ngapi|shamba|mabomba|bomba|tangi|asante|karibu|tafadhali|naomba|wewe|mimi|kwa|ya|na|ni)\b/i;

function offlineReply(text) {
  const t = text.toLowerCase();
  const sw = SW_HINT.test(t) && (t.match(SW_HINT) || []).length > 0 && /\b(habari|jambo|nataka|nahitaji|bei|ngapi|shamba|asante|tafadhali|naomba|mabomba|bomba|limepasuka|imepasuka|inavuja|dharura|ujenzi|nyumba|wewe|mimi|niaje|mambo|sasa)\b/i.test(t);
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
      : `I'm not sure I caught that 🤔. I'm best at plumbing, construction, irrigation, workwear/PPE and OM merch. Could you tell me a bit more about your project — or chat with the team directly?\n[[whatsapp]]\n[[quote:${SERVICES.other}]]`;
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
  const clean = text.replace(/\[\[(quote|whatsapp|shop|human)(?::([^\]]+))?\]\]/gi, (_, type, arg) => { actions.push({ type: type.toLowerCase(), arg: arg?.trim() }); return ""; });
  return { clean: clean.replace(/\n{3,}/g, "\n\n"), actions: actions.slice(0, 3) };
}

// ---------------------------------------------------------------- widget
export function initChat() {
  const panel = document.getElementById("chatPanel");
  if (!panel) return;
  const $ = id => document.getElementById(id);
  const body = $("chatBody"), form = $("chatForm"), input = $("chatText"), sendBtn = form.querySelector(".chat-send");
  const suggest = $("chatSuggest"), modeEl = $("chatMode"), avatar = $("chatAvatar"), title = $("chatTitle");
  const humanFields = $("humanFields"), hName = $("hName"), hPhone = $("hPhone"), foot = $("chatFoot");
  const modeBtns = [...panel.querySelectorAll("[data-mode]")];
  const AI_ICON = avatar.innerHTML;
  const HUMAN_ICON = modeBtns.find(b => b.dataset.mode === "human").querySelector("svg").outerHTML;

  const STORE = "om-chat-v3";
  let state = { mode: "ai", history: [], name: "", phone: "" };
  try { state = { ...state, ...JSON.parse(sessionStorage.getItem(STORE) || "{}") }; } catch {}
  const save = () => { try { sessionStorage.setItem(STORE, JSON.stringify({ ...state, history: state.history.slice(-40) })); } catch {} };

  let chat = null, cloudTried = false, busy = false;
  async function getChat() {
    if (cloudTried) return chat;
    cloudTried = true;
    try {
      const model = await aiModel(SYSTEM_PROMPT);
      if (model) {
        chat = model.startChat({ history: state.history.filter(m => m.mode === "ai" && m.role !== "system").slice(-12).map(m => ({ role: m.role === "user" ? "user" : "model", parts: [{ text: m.text }] })) });
        if (state.mode === "ai") modeEl.textContent = "AI assistant · Gemini-powered";
      }
    } catch (e) { console.warn("[OM] OM AI cloud brain unavailable — using built-in knowledge.", e); }
    return chat;
  }

  const SUGGEST = {
    ai: ["Burst pipe — help!", "Irrigate my farm", "Build or renovate", "Solar water heater", "Opening hours", "Habari! Nahitaji tangi"],
    human: ["I'd like a call back", "Check delivery to my area", "Bulk / corporate order", "After-sales support"]
  };
  function renderSuggest() {
    suggest.innerHTML = SUGGEST[state.mode].map(s => `<button type="button" class="chip">${s}</button>`).join("");
  }
  suggest.addEventListener("click", e => { const b = e.target.closest(".chip"); if (!b) return; if (state.mode === "human") { input.value = b.textContent; input.focus(); } else ask(b.textContent); });

  const scroll = () => { body.scrollTop = body.scrollHeight; };
  function bubble(role, text, { actions = [], raw = false } = {}) {
    const el = document.createElement("div");
    el.className = `msg ${role === "user" ? "user" : role === "system" ? "system" : "bot"}`;
    if (role === "user" || raw) el.textContent = text; else el.innerHTML = md(text);
    if (actions.length) el.appendChild(actionRow(actions));
    body.appendChild(el); scroll(); return el;
  }
  const lastUserText = () => [...state.history].reverse().find(m => m.role === "user")?.text || "";
  function actionRow(actions) {
    const row = document.createElement("div"); row.className = "msg-actions";
    for (const a of actions) {
      const b = document.createElement(a.type === "whatsapp" || a.type === "shop" ? "a" : "button");
      if (b.tagName === "BUTTON") b.type = "button";
      if (a.type === "quote") { b.className = "btn btn-primary"; b.textContent = "Start my quote →"; b.onclick = () => startQuote(a.arg); }
      if (a.type === "human") { b.className = "btn btn-outline"; b.textContent = "Talk to a human"; b.onclick = () => setMode("human", true); }
      if (a.type === "whatsapp") { b.className = "btn btn-outline"; b.textContent = "WhatsApp the team"; b.href = `${WA}?text=${encodeURIComponent("Hello OM Ltd, I'd like help with: " + (lastUserText() || "an enquiry"))}`; b.target = "_blank"; b.rel = "noopener"; }
      if (a.type === "shop") { b.className = "btn btn-outline"; b.textContent = "Open the shop"; b.href = "merch.html"; }
      row.appendChild(b);
    }
    return row;
  }

  function startQuote(service) {
    const svc = Object.values(SERVICES).find(v => v.toLowerCase() === String(service || "").toLowerCase()) || SERVICES.other;
    const notes = state.history.filter(m => m.role === "user" && m.mode === "ai").slice(-3).map(m => `• ${m.text}`).join("\n");
    track("om_ai_quote_start", { service: svc });
    close();
    window.dispatchEvent(new CustomEvent("om:quote", { detail: { service: svc, details: notes ? `From my chat with OM AI:\n${notes}` : "" } }));
  }

  const talk = on => panel.classList.toggle("thinking", on);
  function typing() { const el = document.createElement("div"); el.className = "msg bot"; el.innerHTML = '<span class="typing"><span></span><span></span><span></span></span>'; body.appendChild(el); scroll(); return el; }

  // ---------- AI mode ----------
  async function ask(text) {
    text = text.trim(); if (!text || busy) return;
    if (state.mode === "human") return sendHuman(text);
    busy = true; sendBtn.disabled = true;
    bubble("user", text); state.history.push({ role: "user", text, mode: "ai" }); save();
    track("om_ai_message");
    const tEl = typing(); talk(true);
    let reply = "";
    try {
      const c = await getChat();
      if (!c) throw new Error("offline");
      const result = await c.sendMessageStream(text);
      let el = null;
      for await (const chunk of result.stream) {
        reply += chunk.text();
        if (!el) { tEl.remove(); el = bubble("bot", ""); }
        el.innerHTML = md(splitActions(reply).clean.replace(/\[\[[^\]]*$/, "")); scroll();
      }
      const { clean, actions } = splitActions(reply);
      if (el) { el.innerHTML = md(clean); if (actions.length) el.appendChild(actionRow(actions)); }
      else { tEl.remove(); bubble("bot", clean, { actions }); }
    } catch (e) {
      if (e.message !== "offline") console.warn("[OM] OM AI cloud error, using built-in answers:", e);
      await new Promise(r => setTimeout(r, 400 + Math.random() * 450));
      reply = offlineReply(text); tEl.remove();
      const { clean, actions } = splitActions(reply); bubble("bot", clean, { actions });
    }
    state.history.push({ role: "model", text: reply, mode: "ai" }); save();
    talk(false); busy = false; sendBtn.disabled = false;
  }

  // ---------- Human mode ----------
  async function sendHuman(text) {
    const name = hName.value.trim(), phone = hPhone.value.trim();
    if (!name) { hName.setAttribute("aria-invalid", "true"); hName.focus(); return; }
    if (!/^[0-9+()\s-]{7,}$/.test(phone)) { hPhone.setAttribute("aria-invalid", "true"); hPhone.focus(); return; }
    hName.removeAttribute("aria-invalid"); hPhone.removeAttribute("aria-invalid");
    state.name = name; state.phone = phone;
    busy = true; sendBtn.disabled = true;
    bubble("user", text); state.history.push({ role: "user", text, mode: "human" }); save();
    const aiContext = state.history.filter(m => m.mode === "ai" && m.role === "user").slice(-4).map(m => m.text).join(" | ").slice(0, 600);
    const f = await firestore();
    let ok = false;
    if (f) {
      try {
        await f.fs.addDoc(f.fs.collection(f.db, "liveChats"), {
          name: name.slice(0, 80), phone: phone.slice(0, 40), message: text.slice(0, 2000), context: aiContext,
          page: location.pathname.slice(0, 120), status: "new", createdAt: f.fs.serverTimestamp()
        });
        ok = true; track("human_chat_message");
      } catch (e) { console.warn("[OM] liveChats save failed", e); }
    }
    const wa = `${WA}?text=${encodeURIComponent(`Hello OM Ltd, this is ${name} (${phone}).\n\n${text}`)}`;
    const reply = ok
      ? `✅ Sent to the OM team. A real person will reply on **WhatsApp or a call to ${phone}** — usually within working hours.\nNeed it faster? Message us directly:`
      : `Tap below to send this to the OM team on WhatsApp — a real person will reply.`;
    const el = bubble("bot", reply);
    const row = document.createElement("div"); row.className = "msg-actions";
    row.innerHTML = `<a class="btn ${ok ? "btn-outline" : "btn-primary"}" target="_blank" rel="noopener">Open WhatsApp</a>`;
    row.querySelector("a").href = wa; el.appendChild(row);
    state.history.push({ role: "model", text: reply, mode: "human" }); save();
    busy = false; sendBtn.disabled = false;
    if (!ok) window.open(wa, "_blank", "noopener");
  }

  // ---------- modes ----------
  function setMode(mode, announce) {
    state.mode = mode; save();
    const human = mode === "human";
    panel.classList.toggle("human", human);
    modeBtns.forEach(b => b.setAttribute("aria-pressed", String(b.dataset.mode === mode)));
    avatar.innerHTML = human ? HUMAN_ICON : AI_ICON;
    title.textContent = human ? "OM team" : "OM AI";
    modeEl.textContent = human ? "Real people · reply on WhatsApp" : (chat ? "AI assistant · Gemini-powered" : "AI assistant · replies instantly");
    humanFields.hidden = !human;
    if (human) { hName.value = state.name || ""; hPhone.value = state.phone || ""; }
    input.placeholder = human ? "Write your message to the OM team…" : "Ask OM AI anything…";
    foot.textContent = human ? "Your name & number are only used to reply to you." : "OM AI is an automated assistant. Prices & stock are confirmed by the OM team.";
    renderSuggest();
    if (announce) {
      bubble("system", human ? "You're now messaging the OM team (humans)." : "You're back with OM AI.", { raw: true });
      if (human) bubble("bot", "Hi! 👋 Leave your **name, number and message** below and someone from the OM team will get back to you.");
      track("chat_mode", { mode });
    }
    setTimeout(() => (human && !hName.value ? hName : input).focus(), 50);
  }
  modeBtns.forEach(b => b.addEventListener("click", () => { if (b.dataset.mode !== state.mode) setMode(b.dataset.mode, true); }));

  async function greet() {
    let g = ""; try { const rc = await remoteConfig(); g = rc?.string("assistant_greeting") || ""; } catch {}
    bubble("bot", g || `Hi! I'm **OM AI** 💧\nTell me about your farm, home, worksite or team merch and I'll suggest the right solution and start your quote. Prefer a person? Tap **Talk to a human**.`);
  }
  function render() {
    body.innerHTML = "";
    if (!state.history.length) { greet(); return; }
    for (const m of state.history) {
      if (m.role === "user") bubble("user", m.text);
      else { const { clean, actions } = splitActions(m.text); bubble("bot", clean, { actions: m.mode === "ai" ? actions : [] }); }
    }
  }

  let rendered = false, lastFocus = null;
  function open(opts = {}) {
    if (!rendered) { render(); rendered = true; setMode(state.mode, false); }
    lastFocus = document.activeElement;
    document.body.classList.add("chat-open");
    track("om_ai_open");
    if (opts.mode && opts.mode !== state.mode) setMode(opts.mode, true);
    else setTimeout(() => input.focus(), 250);
    if (opts.ask) setTimeout(() => { if (state.mode !== "ai") setMode("ai", true); ask(opts.ask); }, 300);
  }
  function close() { document.body.classList.remove("chat-open"); lastFocus?.focus?.({ preventScroll: true }); }

  document.addEventListener("click", e => {
    const t = e.target.closest("[data-chat-open]"); if (!t) return;
    e.preventDefault(); open({ ask: t.dataset.chatAsk, mode: t.dataset.chatMode });
  });
  $("chatClose").addEventListener("click", close);
  $("chatReset").addEventListener("click", () => { state.history = []; save(); chat = null; cloudTried = false; body.innerHTML = ""; greet(); if (state.mode === "human") setMode("human", false); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && document.body.classList.contains("chat-open")) close(); });
  form.addEventListener("submit", e => { e.preventDefault(); const v = input.value; if (!v.trim()) return; input.value = ""; input.style.height = ""; ask(v); });
  input.addEventListener("keydown", e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); } });
  input.addEventListener("input", () => { input.style.height = "auto"; input.style.height = Math.min(input.scrollHeight, 120) + "px"; });
  [hName, hPhone].forEach(i => i.addEventListener("input", () => i.removeAttribute("aria-invalid")));
  renderSuggest();
  return { open, close, ask };
}

export const _offlineReply = offlineReply;
