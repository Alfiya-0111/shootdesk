importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: "AIzaSyDzHdXR9R50Wy3yEqS3vz4YJRuE17odWhA",
  authDomain: "shootdesk-ef008.firebaseapp.com",
  projectId: "shootdesk-ef008",
  storageBucket: "shootdesk-ef008.appspot.com",
  messagingSenderId: "906810684866",
  appId: "1:906810684866:web:1023ee2ed22e0dd826d25b",
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  console.log('Background message:', payload)
  
  const notificationTitle = payload.notification?.title || 'ShootDesk'
  const notificationOptions = {
    body: payload.notification?.body || 'New notification',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: payload.data?.orderId || 'default',
    data: payload.data,
    requireInteraction: true,
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  const url = event.notification.data?.url || '/app/dashboard'
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url === url && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url)
      }
    })
  )
})