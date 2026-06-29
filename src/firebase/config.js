import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'
import { doc, setDoc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyDzHdXR9R50Wy3yEqS3vz4YJRuE17odWhA",
  authDomain: "shootdesk-ef008.firebaseapp.com",
  projectId: "shootdesk-ef008",
  storageBucket: "shootdesk-ef008.appspot.com",
  messagingSenderId: "906810684866",
  appId: "1:906810684866:web:1023ee2ed22e0dd826d25b",
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const messaging = getMessaging(app)

export async function requestNotificationPermission(userId) {
  try {
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
      })
      
      if (token && userId) {
        await setDoc(doc(db, 'studios', userId, 'fcmTokens', token), {
          token,
          createdAt: Date.now(),
          platform: 'web',
          lastActive: Date.now()
        })
        console.log('Token saved:', token)
      }
      
      return token
    }
    return null
  } catch (e) {
    console.error('FCM Error:', e)
    return null
  }
}

export function onForegroundMessage(callback) {
  return onMessage(messaging, (payload) => {
    callback(payload)
  })
}

export default app