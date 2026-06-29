// src/services/NotificationService.js

import { requestNotificationPermission, onForegroundMessage, messaging } from '../firebase/config'
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'

// Permission mangna aur token save karna
export async function initializeNotifications(userId) {
  const token = await requestNotificationPermission()
  if (token) {
    // Token Firestore mein save karo
    await setDoc(doc(db, 'studios', userId, 'fcmTokens', token), {
      token,
      createdAt: Date.now(),
      platform: 'web'
    })
    return token
  }
  return null
}

// Foreground notification handler
export function setupForegroundHandler(showToast) {
  return onForegroundMessage((payload) => {
    const { title, body } = payload.notification || {}
    
    // Custom toast show karo
    showToast({
      title: title || 'ShootDesk',
      message: body || '',
      type: payload.data?.type || 'info'
    })
    
    // Browser notification bhi dikhayo
    if (Notification.permission === 'granted') {
      new Notification(title || 'ShootDesk', {
        body: body || '',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: payload.data?.orderId || 'default'
      })
    }
  })
}

// Local scheduled notifications (service worker ke through)
export async function scheduleLocalNotification(title, body, timestamp, tag = 'default') {
  if ('serviceWorker' in navigator && 'showNotification' in ServiceWorkerRegistration.prototype) {
    const registration = await navigator.serviceWorker.ready
    
    // Delay calculate karo
    const delay = timestamp - Date.now()
    if (delay <= 0) return // Past time
    
    setTimeout(() => {
      registration.showNotification(title, {
        body,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag,
        requireInteraction: true,
        data: { url: '/app/dashboard' }
      })
    }, delay)
  }
}

// Shoot reminders schedule karna
export async function scheduleShootReminders(order, studioData) {
  const shootDate = new Date(order.date)
  const [hours, minutes] = (order.time || '10:00').split(':').map(Number)
  shootDate.setHours(hours, minutes, 0, 0)
  
  // 1 day before - 9 PM
  const oneDayBefore = new Date(shootDate)
  oneDayBefore.setDate(oneDayBefore.getDate() - 1)
  oneDayBefore.setHours(21, 0, 0, 0)
  
  // Same day - 2 hours before
  const twoHoursBefore = new Date(shootDate)
  twoHoursBefore.setHours(twoHoursBefore.getHours() - 2)
  
  // Same day - 30 mins before
  const thirtyMinsBefore = new Date(shootDate)
  thirtyMinsBefore.setMinutes(thirtyMinsBefore.getMinutes() - 30)
  
  const reminders = [
    {
      time: oneDayBefore.getTime(),
      title: `🔔 Kal ka Shoot - ${order.clientName}`,
      body: `${order.shootType} shoot hai kal ${order.time || '10:00'} baje @ ${order.venue || 'TBA'}. Team ready?`,
      tag: `reminder-1day-${order.id}`
    },
    {
      time: twoHoursBefore.getTime(),
      title: `⏰ ${order.clientName} - Shoot in 2 Hours`,
      body: `${order.shootType} @ ${order.venue || 'TBA'}. Equipment check kar lo!`,
      tag: `reminder-2hr-${order.id}`
    },
    {
      time: thirtyMinsBefore.getTime(),
      title: `🚀 ${order.clientName} - Time to Go!`,
      body: `30 minutes left! Venue: ${order.venue || 'TBA'}`,
      tag: `reminder-30min-${order.id}`
    }
  ]
  
  // Schedule karo
  for (const reminder of reminders) {
    if (reminder.time > Date.now()) {
      await scheduleLocalNotification(
        reminder.title,
        reminder.body,
        reminder.time,
        reminder.tag
      )
    }
  }
  
  // Firestore mein save karo (for server-side backup)
  await setDoc(doc(db, 'studios', studioData.uid, 'scheduledReminders', order.id), {
    orderId: order.id,
    clientName: order.clientName,
    reminders: reminders.map(r => ({
      ...r,
      scheduled: r.time > Date.now()
    })),
    createdAt: Date.now()
  })
}

// Cancel reminders
export async function cancelReminders(orderId, userId) {
  // Implementation for cancelling scheduled notifications
  // This would need server-side support for FCM scheduled messages
  // For now, local notifications can't be cancelled easily
  // Best approach: server-side scheduling with Cloud Functions
}