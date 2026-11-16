// =============================================================
// OM Ltd — Firebase service layer
// Lazily loads only the Firebase products a page actually uses, and degrades
// gracefully when Firebase isn't configured yet ("offline mode").
// =============================================================
import { firebaseConfig, services } from "../firebase-config.js";

const SDK = "https://www.gstatic.com/firebasejs/13.3.0";
const load = name => import(`${SDK}/firebase-${name}.js`);

export const isConfigured = Boolean(
  firebaseConfig?.apiKey && firebaseConfig?.projectId &&
  !String(firebaseConfig.apiKey).includes("YOUR_") && !String(firebaseConfig.projectId).includes("YOUR_")
);

let appPromise = null;
/** Initialise the Firebase app (+ App Check) once. Resolves to null in offline mode. */
export function getApp() {
  if (!isConfigured) return Promise.resolve(null);
  if (!appPromise) {
    appPromise = (async () => {
      const { initializeApp } = await load("app");
      const app = initializeApp(firebaseConfig);
      if (services.appCheckSiteKey) {
        try {
          if (services.appCheckDebug) self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
          const { initializeAppCheck, ReCaptchaV3Provider } = await load("app-check");
          initializeAppCheck(app, { provider: new ReCaptchaV3Provider(services.appCheckSiteKey), isTokenAutoRefreshEnabled: true });
        } catch (e) { console.warn("[OM] App Check not started:", e); }
      }
      return app;
    })().catch(e => { console.error("[OM] Firebase init failed:", e); return null; });
  }
  return appPromise;
}

const cache = new Map();
const once = (key, fn) => { if (!cache.has(key)) cache.set(key, fn().catch(e => { console.warn(`[OM] ${key} unavailable:`, e); return null; })); return cache.get(key); };

/** Cloud Firestore — returns { db, fs } where fs is the module namespace. */
export const firestore = () => once("firestore", async () => {
  const app = await getApp(); if (!app) return null;
  const fs = await load("firestore");
  return { db: fs.getFirestore(app), fs };
});

/** Cloud Storage */
export const storage = () => once("storage", async () => {
  const app = await getApp(); if (!app || !services.storageUploads) return null;
  const st = await load("storage");
  return { storage: st.getStorage(app), st };
});

/** Authentication */
export const auth = () => once("auth", async () => {
  const app = await getApp(); if (!app) return null;
  const au = await load("auth");
  return { auth: au.getAuth(app), au };
});

/** Google Analytics (respects browsers that don't support it) */
export const analytics = () => once("analytics", async () => {
  const app = await getApp(); if (!app || !services.analytics || !firebaseConfig.measurementId || firebaseConfig.measurementId.includes("XXXX")) return null;
  const an = await load("analytics");
  if (!(await an.isSupported())) return null;
  return { analytics: an.getAnalytics(app), an };
});

/** Fire-and-forget analytics event */
export function track(name, params = {}) {
  analytics().then(a => { if (a) a.an.logEvent(a.analytics, name, params); }).catch(() => {});
}

/** Remote Config with safe defaults */
export const REMOTE_DEFAULTS = {
  announcement_text: "Smart water solutions · Reliable supply · Professional service",
  mo_ai_enabled: true,
  mo_ai_model: services.moAi?.model || "gemini-3.5-flash-lite",
  mo_ai_greeting: ""
};
export const remoteConfig = () => once("remoteConfig", async () => {
  const app = await getApp(); if (!app || !services.remoteConfig) return null;
  const rc = await load("remote-config");
  if (!(await rc.isSupported())) return null;
  const cfg = rc.getRemoteConfig(app);
  cfg.settings.minimumFetchIntervalMillis = 60 * 60 * 1000;
  cfg.defaultConfig = REMOTE_DEFAULTS;
  await rc.fetchAndActivate(cfg).catch(() => {});
  return {
    string: k => rc.getString(cfg, k),
    bool: k => rc.getBoolean(cfg, k)
  };
});

/** Firebase AI Logic — a Gemini model for Mo AI. Returns null if disabled. */
export const aiModel = (systemInstruction) => once("ai", async () => {
  if (!services.moAi?.enabled) return null;
  const app = await getApp(); if (!app) return null;
  const rc = await remoteConfig();
  if (rc && !rc.bool("mo_ai_enabled")) return null;
  const model = (rc && rc.string("mo_ai_model")) || services.moAi.model;
  const ai = await load("ai");
  const backend = ai.getAI(app, { backend: new ai.GoogleAIBackend() });
  return ai.getGenerativeModel(backend, {
    model,
    systemInstruction,
    generationConfig: { temperature: services.moAi.temperature ?? 0.6, maxOutputTokens: 700 }
  });
});
