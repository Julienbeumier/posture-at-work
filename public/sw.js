self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || "PostureAtWork", {
      body: data.body || "N'oublie pas ta pause exercices !",
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      data: { url: data.url || "/mobilite" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || "/mobilite")
  );
});
