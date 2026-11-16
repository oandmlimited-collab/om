// =============================================================
// OM Ltd — Firebase configuration (project: portifolio-app-1125c)
// The web config is NOT a secret; data is protected by Firestore/Storage
// rules + App Check. Do NOT paste the Firebase console's `import ... from
// "firebase/app"` lines here — the site loads the SDK itself.
// =============================================================
export const firebaseConfig = {
  apiKey: "AIzaSyAzbniDQb400XSD11N8_7AgZB3fA9BYmgs",
  authDomain: "portifolio-app-1125c.firebaseapp.com",
  projectId: "portifolio-app-1125c",
  storageBucket: "portifolio-app-1125c.firebasestorage.app",
  messagingSenderId: "736723368522",
  appId: "1:736723368522:web:c32e630f9c2bcb21a484b3",
  measurementId: "G-1BXZY3YNBX"
};

export const services = {
  // App Check (recommended before launch — required for OM AI cloud mode).
  // Create a reCAPTCHA v3 key at https://www.google.com/recaptcha/admin and register it
  // in Firebase Console → App Check → your web app, then paste the SITE key here.
  appCheckSiteKey: "",
  appCheckDebug: false,          // true only while testing on localhost

  analytics: true,               // uses measurementId above
  storageUploads: true,          // quote attachments → Cloud Storage
  remoteConfig: true,            // live announcement text + OM AI switches

  // OM AI cloud brain — Firebase AI Logic (Gemini Developer API).
  // Enable in Firebase Console → AI Logic → Get started, set up App Check, then set enabled: true.
  // While false, OM AI uses its built-in answers (and Human mode works either way).
  assistant: {
    enabled: false,
    model: "gemini-3.5-flash-lite",   // can be changed live via Remote Config key `assistant_model`
    temperature: 0.6
  }
};
