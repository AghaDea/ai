"use strict";

self.addEventListener("install", event => {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", event => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener("notificationclick", event => {
    event.notification.close();

    event.waitUntil((async () => {
        const url = event.notification.data?.url;

        const windows = await self.clients.matchAll({
            type: "window",
            includeUncontrolled: true
        });

        for (const client of windows) {
            if (client.url === url && "focus" in client) {
                await client.focus();
                return;
            }
        }

        if (url && self.clients.openWindow) {
            await self.clients.openWindow(url);
        }
    })());
});