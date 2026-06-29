// src/components/ToastNotification.jsx
import { useState, useEffect } from 'react'
import { MdClose } from 'react-icons/md'

export default function ToastNotification({ toast, onClose }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (toast) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
        setTimeout(onClose, 300)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  if (!toast) return null

  const colors = {
    info: '#6366f1',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    today: '#ef4444',
    tomorrow: '#f59e0b',
  }

  return (
    <div style={{
      position: 'fixed',
      top: 80,
      left: 20,
      right: 20,
      background: 'var(--bg3)',
      border: `1px solid ${colors[toast.type] || colors.info}44`,
      borderLeft: `4px solid ${colors[toast.type] || colors.info}`,
      borderRadius: 12,
      padding: 14,
      zIndex: 1000,
      transform: visible ? 'translateY(0)' : 'translateY(-100px)',
      opacity: visible ? 1 : 0,
      transition: 'all 0.3s ease',
      boxShadow: '0 8px 32px #00000044',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: colors[toast.type] || colors.info, marginBottom: 4 }}>
            {toast.title}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>
            {toast.message}
          </div>
        </div>
        <button
          onClick={() => { setVisible(false); setTimeout(onClose, 300) }}
          style={{ background: 'transparent', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 4 }}
        >
          <MdClose size={18} />
        </button>
      </div>
    </div>
  )
}