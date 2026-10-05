# atlas-chrome-extension-quickstart

A minimal **MV3** Chrome extension authenticated with Atlas, using
`@atlasauth/chrome-extension`.

## What's wired

- **`src/background.js`** — the service worker builds the client with
  `createAtlasClient({ background: true })` (from `.../background`) and keeps the
  session token fresh on a `chrome.alarms` tick via `client.syncSessionToken()`
  (MV3 workers have no long-lived timer).
- **`src/popup.js`** — the popup uses `createAtlasClient()`; its `client.fapi`
  is bearer-wired from the token in `chrome.storage.local`, so a
  `GET /v1/client` reads the session. `client.setToken` / `client.signOut` round
  out the lifecycle.
- Config lives in **`src/config.js`** (an extension can't read a `.env` at
  runtime) — set your `publishableKey` + `frontendApi` there.

### Getting a token

Production sign-in runs `chrome.identity.launchWebAuthFlow` against Atlas's OAuth
endpoints, then `exchangeForSession(...)` (re-exported from this package) →
`client.setToken(session.sessionToken)`. For this quickstart the popup lets you
paste a session JWT to seed the store so you can see the authenticated calls work.

## Run

```sh
npm install
# edit src/config.js with your keys
npm run build        # bundles src/* -> dist/* with esbuild
```

Then load it in Chrome: `chrome://extensions` → enable Developer mode → **Load
unpacked** → select this folder.

## Packages

- `@atlasauth/chrome-extension` — `createAtlasClient` (+ `/background`),
  `syncSessionToken`, `exchangeForSession`, `createNativeSessionManager`
