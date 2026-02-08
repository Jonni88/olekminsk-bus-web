// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// TODO: Replace with your Firebase config
firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
});

const messaging = firebase.messaging();

// Background message handler
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Received background message:', payload);

  const { title, body } = payload.notification || {};
  const data = payload.data || {};

  const notificationOptions = {
    body: body || 'Новое уведомление',
    icon: '/icon-192.png',
    badge: '/icon-72.png',
    tag: data.type || 'default',
    data: data,
    actions: getActions(data),
    requireInteraction: data.type === 'bus_reminder'
  };

  self.registration.showNotification(title || 'Автобусы Олёкминск', notificationOptions);
});

// Get notification actions based on type
function getActions(data) {
  switch (data.type) {
    case 'bus_reminder':
      return [
        { action: 'open', title: 'Открыть' },
        { action: 'dismiss', title: 'Закрыть' }
      ];
    case 'schedule_update':
      return [
        { action: 'view', title: 'Посмотреть' }
      ];
    default:
      return [];
  }
}

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data;
  let url = '/';

  if (data.routeId) {
    url = `/?route=${data.routeId}`;
    if (data.direction) url += `&direction=${encodeURIComponent(data.direction)}`;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // If app is already open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Otherwise open new window
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Install event - cache assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(clients.claim());
});
