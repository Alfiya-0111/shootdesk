import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { collection, query, getDocs, orderBy } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import { MdAdd, MdArrowForward } from 'react-icons/md'

const STATUS_COLORS = {
  Confirmed: '#3B82F6',
  'Advance Paid': '#F59E0B',
  Pending: '#6366F1',
  Completed: '#10B981',
  Cancelled: '#EF4444',
}

function getDaysDiff(dateStr) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const d = new Date(dateStr); d.setHours(0, 0, 0, 0)
  return Math.round((d - today) / 86400000)
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short'
  })
}

function DayBadge({ dateStr }) {
  const diff = getDaysDiff(dateStr)
  if (diff < 0)  return <span style={{ background: '#1f1f2e', color: '#6b7280', padding: '2px 10px', borderRadius: 20, fontSize: 11 }}>Past</span>
  if (diff === 0) return <span style={{ background: '#ef44441a', color: '#ef4444', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>TODAY 🔴</span>
  if (diff === 1) return <span style={{ background: '#f59e0b1a', color: '#f59e0b', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>Tomorrow ⚡</span>
  return <span style={{ background: '#3b82f61a', color: '#60a5fa', padding: '2px 10px', borderRadius: 20, fontSize: 11 }}>In {diff} days</span>
}

export default function Dashboard() {
  const { currentUser, studioData } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    try {
      const q = query(
        collection(db, 'studios', currentUser.uid, 'orders'),
        orderBy('date', 'asc')
      )
      const snap = await getDocs(q)
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setOrders(data)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const todayOrders     = orders.filter(o => getDaysDiff(o.date) === 0 && o.status !== 'Cancelled')
  const tomorrowOrders  = orders.filter(o => getDaysDiff(o.date) === 1 && o.status !== 'Cancelled')
  const upcomingOrders  = orders.filter(o => getDaysDiff(o.date) >= 0 && o.status !== 'Cancelled' && o.status !== 'Completed')
  const completedOrders = orders.filter(o => o.status === 'Completed')
  const totalRevenue    = completedOrders.reduce((s, o) => s + Number(o.total || 0), 0)
  const pendingBalance  = orders
    .filter(o => o.status !== 'Completed' && o.status !== 'Cancelled')
    .reduce((s, o) => s + (Number(o.total || 0) - Number(o.advance || 0)), 0)

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good Morning'
    if (h < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text3)' }}>
      Loading...
    </div>
  )

  return (
    <div className="page">

      {/* Greeting */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: 'var(--text3)' }}>{greeting()} 👋</div>
        <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'Syne, sans-serif' }}>
          {studioData?.ownerName || 'Studio Owner'}
        </div>
        <div style={{ fontSize: 13, color: 'var(--purple2)' }}>{studioData?.studioName}</div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Upcoming Shoots', value: upcomingOrders.length, color: '#6366f1', suffix: '' },
          { label: 'Completed', value: completedOrders.length, color: '#10b981', suffix: '' },
          { label: 'Revenue Earned', value: `₹${(totalRevenue / 1000).toFixed(1)}k`, color: '#10b981', suffix: '' },
          { label: 'Balance Pending', value: `₹${(pendingBalance / 1000).toFixed(1)}k`, color: '#f59e0b', suffix: '' },
        ].map((s, i) => (
          <div key={i} style={{
            background: 'var(--bg3)',
            border: `1px solid ${s.color}33`,
            borderLeft: `3px solid ${s.color}`,
            borderRadius: 14,
            padding: '14px 12px',
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Today Alert */}
      {todayOrders.length > 0 && (
        <div style={{
          background: '#ef44440d',
          border: '1px solid #ef444433',
          borderRadius: 14,
          padding: 14,
          marginBottom: 14,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#ef4444', marginBottom: 8 }}>
            🔴 Aaj ke Shoots ({todayOrders.length})
          </div>
          {todayOrders.map(o => (
            <Link key={o.id} to={`/app/orders`} style={{ textDecoration: 'none' }}>
              <div style={{
                background: '#ef44441a',
                borderRadius: 10,
                padding: '10px 12px',
                marginBottom: 6,
              }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{o.clientName}</div>
                <div style={{ fontSize: 12, color: '#fca5a5' }}>
                  {o.shootType} • {o.time} • {o.venue}
                </div>
                {o.team?.length > 0 && (
                  <div style={{ fontSize: 11, color: '#f87171', marginTop: 4 }}>
                    👥 {o.team.join(', ')}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Tomorrow Alert */}
      {tomorrowOrders.length > 0 && (
        <div style={{
          background: '#f59e0b0d',
          border: '1px solid #f59e0b33',
          borderRadius: 14,
          padding: 14,
          marginBottom: 14,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b', marginBottom: 8 }}>
            ⚡ Kal ke Shoots ({tomorrowOrders.length})
          </div>
          {tomorrowOrders.map(o => (
            <div key={o.id} style={{
              background: '#f59e0b1a',
              borderRadius: 10,
              padding: '10px 12px',
              marginBottom: 6,
            }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{o.clientName}</div>
              <div style={{ fontSize: 12, color: '#fcd34d' }}>
                {o.shootType} • {o.time} • {o.venue}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No shoots today */}
      {todayOrders.length === 0 && tomorrowOrders.length === 0 && (
        <div style={{
          background: 'var(--bg3)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          padding: 20,
          textAlign: 'center',
          marginBottom: 14,
        }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>😴</div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Aaj aur kal koi shoot nahi</div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>Enjoy the break!</div>
        </div>
      )}

      {/* Upcoming Shoots */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div className="section-title" style={{ marginBottom: 0 }}>Upcoming Orders</div>
        <Link to="/app/orders" style={{ fontSize: 12, color: 'var(--purple2)', display: 'flex', alignItems: 'center', gap: 2 }}>
          Sab dekho <MdArrowForward size={14} />
        </Link>
      </div>

      {upcomingOrders.length === 0 ? (
        <div style={{ color: 'var(--text3)', fontSize: 13, textAlign: 'center', padding: 24 }}>
          Koi upcoming order nahi
        </div>
      ) : (
        upcomingOrders.slice(0, 5).map(o => (
          <Link key={o.id} to="/app/orders" style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'var(--bg3)',
              border: `1px solid ${getDaysDiff(o.date) === 0 ? '#ef444433' : getDaysDiff(o.date) === 1 ? '#f59e0b33' : 'var(--border)'}`,
              borderRadius: 14,
              padding: 14,
              marginBottom: 10,
              cursor: 'pointer',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{o.clientName}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>{o.shootType}</div>
                </div>
                <DayBadge dateStr={o.date} />
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 12, color: 'var(--text2)' }}>
                <span>📅 {formatDate(o.date)}</span>
                <span>⏰ {o.time}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, alignItems: 'center' }}>
                <span style={{
                  background: (STATUS_COLORS[o.status] || '#64748b') + '20',
                  color: STATUS_COLORS[o.status] || '#64748b',
                  padding: '2px 10px',
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 600,
                }}>
                  {o.status}
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#10b981' }}>
                  ₹{Number(o.total || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </Link>
        ))
      )}

      {/* FAB - Add Order */}
      <Link to="/app/orders/add">
        <button style={{
          position: 'fixed',
          bottom: 80,
          right: 20,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          border: 'none',
          borderRadius: '50%',
          width: 56,
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 8px 24px #6366f155',
          zIndex: 99,
        }}>
          <MdAdd size={28} color="#fff" />
        </button>
      </Link>

    </div>
  )
}