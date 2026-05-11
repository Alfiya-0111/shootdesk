import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import NotificationBell from './NotificationBell'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { studioData } = useAuth()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 70 }}>
      {/* Top Header */}
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

      {/* Page Content */}
      <Outlet />

      {/* Bottom Navbar */}
      <Navbar />
    </div>
  )
}