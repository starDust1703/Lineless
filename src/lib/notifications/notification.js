export async function requestNotificationPermission() {
  if (!("Notification" in window)) return false;

  if (Notification.permission === "granted") return true;

  const permission = await Notification.requestPermission();
  return permission === "granted";
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js");
}

export async function sendNotification(title, body) {
  if (Notification.permission !== "granted") return;

  const reg = await navigator.serviceWorker.getRegistration();

  reg.showNotification(title, {
    body,
    icon: '/icon.svg',
    badge: '/icon.svg',
    vibrate: [200, 100, 200],
  });
}
