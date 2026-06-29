import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { requestNotificationPermission, onForegroundMessage } from '../firebase/config'
import Navbar from './Navbar'
import NotificationBell from './NotificationBell'
import ToastNotification from './ToastNotification'

export default function Layout() {
  const { currentUser, studioData } = useAuth()
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (currentUser) {
      // Token save karo
      requestNotificationPermission(currentUser.uid)
      
      // Foreground messages
      const unsubscribe = onForegroundMessage((payload) => {
        setToast({
          title: payload.notification?.title,
          message: payload.notification?.body,
          type: payload.data?.type || 'info'
        })
      })
      
      return () => { if (unsubscribe) unsubscribe() }
    }
  }, [currentUser])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 70 }}>
      <ToastNotification toast={toast} onClose={() => setToast(null)} />
      
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        borderBottom: '1px solid var(--border)',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div>
          <div style={{
            fontSize: 18,
            fontWeight: 800,
            fontFamily: 'Syne, sans-serif',
            background: 'linear-gradient(90deg, #c084fc, #818cf8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            📸 ShootDesk
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>
            {studioData?.studioName || 'Your Studio'}
          </div>
        </div>
        <NotificationBell />
      </div>

      <Outlet />
      <Navbar />
    </div>
  )
}