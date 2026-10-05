// MV3 background service worker.
//
// A service worker has no long-lived timer (MV3 evicts it), so instead of the
// web SDK's in-page refresh loop we keep the session token fresh on a
// `chrome.alarms` tick: each wake calls `client.syncSessionToken()`, which
// refreshes the token if it is near expiry and writes it back to chrome.storage.
import { createAtlasClient } from '@atlasauth/chrome-extension/background';
import { ATLAS_CONFIG } from './config.js';

const client = createAtlasClient({
  publishableKey: ATLAS_CONFIG.publishableKey,
  frontendApi: ATLAS_CONFIG.frontendApi,
  background: true,
});

// Keep the token warm.
chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create('atlas-refresh', { periodInMinutes: 1 });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'atlas-refresh') void client.syncSessionToken();
});
