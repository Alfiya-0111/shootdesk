import { useState, useEffect } from 'react'
import { MdNotifications } from 'react-icons/md'
import { useAuth } from '../context/AuthContext'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'

export default function NotificationBell() {
  const { currentUser } = useAuth()
  const [alerts, setAlerts] = useState([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!currentUser) return
    fetchAlerts()
  }, [currentUser])

  async function fetchAlerts() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const dayAfter = new Date(today)
    dayAfter.setDate(dayAfter.getDate() + 2)

    const todayStr    = today.toISOString().split('T')[0]
    const tomorrowStr = tomorrow.toISOString().split('T')[0]
    const dayAfterStr = dayAfter.toISOString().split('T')[0]

    try {
      const q = query(
        collection(db, 'studios', currentUser.uid, 'orders'),
        where('status', 'not-in', ['Cancelled', 'Completed'])
      )
      const snap = await getDocs(q)
      const notifs = []

      snap.forEach(doc => {
        const o = doc.data()
        if (o.date === todayStr)    notifs.push({ type: 'today',    msg: `🔴 TODAY: ${o.shootType} — ${o.clientName} @ ${o.time}` })
        if (o.date === tomorrowStr) notifs.push({ type: 'tomorrow', msg: `⚡ Tomorrow: ${o.shootType} — ${o.clientName}` })
        if (o.date === dayAfterStr) notifs.push({ type: 'soon',     msg: `🗓 Day after: ${o.shootType} — ${o.clientName}` })
      })

      setAlerts(notifs)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          background: 'var(--bg2)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: '7px 10px',
          color: alerts.length > 0 ? 'var(--gold)' : 'var(--text3)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 13,
        }}
      >
        <MdNotifications size={18} />
        {alerts.length > 0 && (
          <span style={{
            background: 'var(--red)',
            color: '#fff',
            borderRadius: '50%',
            width: 16,
            height: 16,
            fontSize: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
          }}>
            {alerts.length}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 44,
          right: 0,
          background: 'var(--bg3)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          width: 280,
          zIndex: 200,
          overflow: 'hidden',
          boxShadow: '0 8px 32px #0006',
        }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontSize: 13, fontWeight: 700, color: 'var(--text2)' }}>
            Upcoming Alerts
          </div>
          {alerts.length === 0 ? (
            <div style={{ padding: 16, fontSize: 13, color: 'var(--text3)', textAlign: 'center' }}>
              No upcoming shoots 🎉
            </div>
          ) : (
            alerts.map((a, i) => (
              <div key={i} style={{
                padding: '10px 14px',
                borderBottom: '1px solid var(--border)',
                fontSize: 13,
                color: a.type === 'today' ? 'var(--red)' : a.type === 'tomorrow' ? 'var(--gold)' : 'var(--text2)',
              }}>
                {a.msg}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}