// =============================================================
// OM Ltd — Firebase configuration
// 1. Firebase Console → Project settings → Your apps → Web app → copy config.
// 2. Paste the values below (the web config is NOT a secret; security comes
//    from Firestore/Storage rules + App Check).
// 3. Fill in `services` keys as you switch each product on.
// Until apiKey/projectId are filled in, the site runs in "offline mode":
// forms fall back to email/WhatsApp and Mo AI uses its built-in knowledge.
// =============================================================
export const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_FIREBASE_APP_ID",
  measurementId: "G-XXXXXXXXXX" // Google Analytics (optional)
};

export const services = {
  // App Check (strongly recommended before launch — required for Mo AI cloud mode).
  // Create a reCAPTCHA v3 key at https://www.google.com/recaptcha/admin and register it
  // in Firebase Console → App Check → your web app.
  appCheckSiteKey: "",
  appCheckDebug: false,          // true only while testing on localhost

  analytics: true,               // uses measurementId above
  storageUploads: true,          // quote attachments → Cloud Storage
  remoteConfig: true,            // live announcement text + Mo AI switches

  // Mo AI cloud brain — Firebase AI Logic (Gemini Developer API).
  // Enable in Firebase Console → AI Logic → Get started. Leave false to use Mo's offline brain.
  moAi: {
    enabled: false,
    model: "gemini-3.5-flash-lite",   // can be overridden live via Remote Config key `mo_ai_model`
    temperature: 0.6
  }
};
