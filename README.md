# OM Ltd website: v2 "Flowing Solutions"

A glassmorphism website for OM Ltd. It includes **Mo AI**, a robot assistant, a merch shop built from the OM posters, newsletters, reviews and a team dashboard, all running on Firebase.

The site works before Firebase is connected ("offline mode"). In that mode:
- forms fall back to email or WhatsApp
- Mo AI answers from its built-in OM knowledge

## What's inside

| Path | What it is |
|---|---|
| `index.html` | Home page. It has the hero with Mo, services, sectors, the poster gallery, the 3-step process, a Mo AI section, the newsletter signup and the quote form. Quote attachments are uploaded to Cloud Storage. |
| `merch.html` | Shop with three tabs: **Signature gear** (OM Smart Backpack in 6 colours and OM Notebook in 5 colours, each with a colour switcher), **Workwear & PPE** and **Farm & irrigation**. An "enquiry list" tray carries the chosen items into the quote form. |
| `founders.html` | Founder cards and company values |
| `testimonials.html` | Shows only approved reviews from Firestore. Visitors can submit a review, which waits for approval. |
| `newsletter.html` | Subscribe with topic preferences, or unsubscribe. Every email's unsubscribe link points here. |
| `admin.html` | **Team dashboard.** Sign in with Google to see live quotes (status, attachments, CSV export), approve reviews, manage subscribers and **compose and send newsletters**. |
| `404.html` | Branded "this pipe leads nowhere" page |
| `js/firebase.js` | Firebase service layer (lazy-loaded SDK v13.3.0). Covers App Check, Firestore, Storage, Auth, Analytics, Remote Config and AI Logic. |
| `js/mo-ai.js` | Mo AI. Uses a Gemini brain via Firebase AI Logic when enabled, with an offline English/Kiswahili brain as fallback. |
| `js/app.js` | Animations and all public forms |
| `js/admin.js` | Dashboard logic and newsletter sender |
| `firebase-config.js` | **Edit this file:** your keys and feature switches |
| `firestore.rules`, `storage.rules` | Security rules, tested with the Firebase emulator (18/18 checks pass) |
| `firestore.indexes.json` | Index used by the reviews page |
| `remoteconfig.template.json` | Live-editable settings: announcement text, Mo on/off, Mo model, Mo greeting |
| `_build/build.py` | Optional generator for all pages (shared header, footer and Mo panel). Run `python _build/build.py .` after editing it. You can also edit the HTML directly. |

## Firebase features used
- **Hosting**: target `om-services-site`, mapped to the `om-services` site in project `portifolio-app-1125c`
- **Cloud Firestore**:
  - quotation requests
  - newsletter subscribers and unsubscribes
  - campaigns
  - reviews
  - the outbound `mail` queue
- **Cloud Storage**: photo and PDF attachments on quotes (max 3 files, 8 MB each; the public can't read them)
- **Authentication**: Google sign-in for the team dashboard
- **AI Logic (Gemini)**: Mo AI's cloud brain
- **App Check (reCAPTCHA v3)**: blocks bots and abuse of the AI and database
- **Analytics**: tracks leads, sign-ups, Mo usage and add-to-enquiry events
- **Remote Config**: lets you change the announcement bar and Mo settings without redeploying
- **Trigger Email extension**: delivers newsletters

## Setup (about 20 minutes)

### 1. Connect the site to Firebase
1. Go to Firebase Console → Project settings → Your apps → **Web app**.
2. Copy the config into `firebase-config.js`.
3. Also copy the `measurementId` if you use Analytics.

### 2. Turn on the Firebase products
In the Firebase Console:
- **Firestore Database**: create a database (production mode).
- **Storage**: get started.
- **Authentication**: Sign-in method → enable **Google**. Then go to Settings → Authorised domains and add your site's domain.
- **App Check**:
  1. Create a reCAPTCHA v3 key and register it for the web app.
  2. Paste the site key into `services.appCheckSiteKey`.
  3. Turn on enforcement for Firestore, Storage and AI Logic once you've confirmed everything works.

### 3. Give yourself admin access
1. Open `/admin` and sign in with Google. The page shows your UID.
2. In Firestore, create a document at `admins/<your UID>` (any field, e.g. `role: "owner"`).
3. Reload the page.

### 4. Enable Mo AI's cloud brain (optional)
1. Firebase Console → **AI Logic** → Get started → choose the **Gemini Developer API**.
2. In `firebase-config.js`, set `services.moAi.enabled = true`.
3. Make sure App Check is set up first, so nobody can use your AI quota.

### 5. Set up newsletter sending
1. Install the extension:
   ```bash
   firebase ext:install firebase/firestore-send-email
   ```
2. Use these settings:
   - Collection: **`mail`**
   - SMTP: your email provider. For Gmail, use an App Password: `smtps://oandmlimited@gmail.com@smtp.gmail.com:465`
3. Then go to `/admin` → **Compose newsletter** → **Send test to me** → **Send**.

Unsubscribed emails are excluded automatically. Every email includes an unsubscribe link.

### 6. Deploy
```bash
npm install -g firebase-tools
firebase login
firebase deploy --only hosting:om-services-site,firestore,storage,remoteconfig
```
The first time you load the reviews page, Firestore may ask for an index. `firestore.indexes.json` already includes it.

### Preview locally
```bash
python -m http.server 8000   # then open http://localhost:8000
```

## Before launch
- Replace the founder placeholder text with approved bios and photos.
- Only publish reviews from real customers who gave permission. The site never invents reviews.
- Confirm product specs and availability. Mo is told never to invent prices, stock or delivery times.
- Your previous site is kept in `_backup_v1/`. Deploys ignore that folder.
