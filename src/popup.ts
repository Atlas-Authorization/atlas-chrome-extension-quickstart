// Popup UI (vanilla). Shares the same token store (chrome.storage.local) as the
// background worker via @atlasauth/chrome-extension's `createAtlasClient`, whose
// `fapi` client is already bearer-wired from the stored session token.
import { createAtlasClient } from '@atlasauth/chrome-extension';
import { ATLAS_CONFIG } from './config';

const client = createAtlasClient({
  publishableKey: ATLAS_CONFIG.publishableKey,
  frontendApi: ATLAS_CONFIG.frontendApi,
});

const $ = <T extends HTMLElement = HTMLElement>(id: string): T => {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing #${id}`);
  return el as T;
};
const out = (v: unknown): void => {
  $('out').textContent = typeof v === 'string' ? v : JSON.stringify(v, null, 2);
};

/** Shape of `GET /v1/client` (only the fields this popup reads). */
interface ClientView {
  session?: { id: string } | null;
  user?: unknown;
}

// Read the session: a bearer-authenticated GET /v1/client (the stored token is
// attached automatically by the client's wrapped fetch).
async function render(): Promise<void> {
  const token = await client.getToken();
  if (!token) {
    out('Signed out. Paste a session token to seed, or wire launchWebAuthFlow.');
    return;
  }
  const res = await client.fapi.get<ClientView>('/v1/client');
  out(res.ok ? { user: res.data?.user, sessionId: res.data?.session?.id } : 'Token present but not valid.');
}

// Production sign-in: run chrome.identity.launchWebAuthFlow against Atlas's
// OAuth endpoints, then `exchangeForSession(...)` (from @atlasauth/js, re-exported
// here) and `client.setToken(session.sessionToken)`. For this quickstart we let
// you paste a session token to seed the store.
$('seed').addEventListener('click', async () => {
  const token = $<HTMLInputElement>('token').value.trim();
  if (token) await client.setToken(token);
  await render();
});

$('refresh').addEventListener('click', async () => {
  await client.syncSessionToken({ force: true });
  await render();
});

$('signout').addEventListener('click', async () => {
  await client.signOut();
  await render();
});

void render();
