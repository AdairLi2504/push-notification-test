/**
 * sw.js - Service Worker for Web Push Notification
 * ------------------------------------------------
 * Purpose:
 * 1) Receive push events sent by the backend via Web Push
 * 2) Parse payload and display system notifications
 * 3) Handle navigation logic when user clicks on the notification
 *
 * Notes:
 * - This file should be placed at the site root path (e.g., /sw.js) to cover a larger scope
 * - Only available under HTTPS or localhost
 */

/**
 * Optional: Install phase
 * Usually used for pre-caching static resources; this example only logs.
 */
self.addEventListener("install", (event) => {
  // Immediately move to activation phase (skip waiting)
  self.skipWaiting();
  console.log("[SW] Installed");
});

/**
 * Optional: Activation phase
 * Can be used for cleaning up old caches; this example takes control of all existing pages.
 */
self.addEventListener("activate", (event) => {
  // Let the current SW immediately control already-opened pages
  event.waitUntil(self.clients.claim());
  console.log("[SW] Activated");
});

/**
 * Core: Receive Push messages
 * The payload sent by the backend (usually JSON) will be in event.data.
 */
self.addEventListener("push", (event) => {
  console.log("[SW] Push event received");
  const receivedAt = new Date().toLocaleTimeString();
  // Default notification content (fallback when payload is empty or parsing fails)
  let data = {
    title: "Test Notification",
    body: "Failed To Get The Payload",
  };

  // Try to parse the backend payload
  // If the backend sends a JSON string, for example:
  // {"title":"Hello","body":"World","url":"/messages"}
  if (event.data) {
    try {
      const incoming = event.data.json();
      data = { ...data, ...incoming };
    } catch (e) {
      // If it's not JSON, treat it as plain text for the body
      data.body = event.data.text();
    }
  }

  // Display system notification (must be called within the push event)
  event.waitUntil(
    (async () => {
      await self.registration.showNotification(data.title, {
        body: data.body,
      });

      const clientList = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      for (const client of clientList) {
        client.postMessage({
          type: "push-received",
          receivedAt,
        });
      }
    })()
  );
});

/**
 * Triggered when user clicks on the notification
 * Logic:
 * 1) Close the notification
 * 2) If a page with the same URL already exists, focus it
 * 3) Otherwise, open a new window
 */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl =
    (event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Try to reuse an already-opened page
      for (const client of clientList) {
        // You can also use stricter matching (e.g., full URL)
        if ("focus" in client) {
          client.navigate?.(targetUrl);
          return client.focus();
        }
      }
      // If no available window exists, open a new one
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

/**
 * Optional: Triggered when notification is closed (not by clicking)
 * Can be used for analytics to track "notification ignored".
 */
self.addEventListener("notificationclose", (event) => {
  console.log("[SW] Notification closed:", event.notification.tag);
});