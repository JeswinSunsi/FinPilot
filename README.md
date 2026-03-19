# finance

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

## PWA Support

The frontend is configured as a Progressive Web App via `vite-plugin-pwa`.

- Build generates a service worker and web manifest automatically.
- Install prompts are available on supported desktop and mobile browsers.
- App icons live in `public/pwa-192x192.png`, `public/pwa-512x512.png`, and `public/apple-touch-icon.png`.

To verify locally:

```sh
npm run build
npm run preview
```

Then open DevTools -> Application and confirm:

- Manifest is valid.
- Service Worker is active.
- Installability checks pass.

## Backend Setup (FastAPI + Groq Vision)

The backend code lives in `app` and powers the live SMS simulator plus receipt photo analysis.

1. Install backend packages:

```sh
pip install -r app/requirements.txt
```

2. Set Groq credentials before starting backend:

```powershell
$env:GROQ_API_KEY="your_groq_api_key"
# Optional: override default vision model
$env:GROQ_VISION_MODEL="meta-llama/llama-4-scout-17b-16e-instruct"
```

3. Run backend:

```sh
uvicorn app.main:app --host 127.0.0.1 --port 8010 --reload
```

4. Make sure frontend points to backend URL:

```powershell
$env:VITE_SMS_BACKEND_BASE_URL="http://127.0.0.1:8010"
```

Receipt APIs:

- `GET /receipts/status`
- `POST /receipts/analyze` with form-data file field `file`
