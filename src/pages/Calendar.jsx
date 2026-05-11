import { useState, useEffect } from 'react'
import { collection, query, getDocs, orderBy } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import { MdChevronLeft, MdChevronRight, MdClose } from 'react-icons/md'

const STATUS_COLORS = {
  Confirmed: '#3B82F6',
  'Advance Paid': '#F59E0B',
  Pending: '#6366F1',
  Completed: '#10B981',
  Cancelled: '#EF4444',
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
}

function getDaysDiff(dateStr) {
  const today = new Date(); today.setHours(0,0,0,0)
  const d = new Date(dateStr); d.setHours(0,0,0,0)
  return Math.round((d - today) / 86400000)
}

export default function CalendarPage() {
  const { currentUser } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [calMonth, setCalMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(null)
  const [dayOrders, setDayOrders] = useState([])

  useEffect(() => { fetchOrders() }, [])

  async function fetchOrders() {
    try {
      const q = query(
        collection(db, 'studios', currentUser.uid, 'orders'),
        orderBy('date', 'asc')
      )
      const snap = await getDocs(q)
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  function getOrdersOnDate(year, month, day) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return orders.filter(o => o.date === dateStr && o.status !== 'Cancelled')
  }

  function handleDayClick(day) {
    const year  = calMonth.getFullYear()
    const month = calMonth.getMonth()
    const found = getOrdersOnDate(year, month, day)
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    setSelectedDay(dateStr)
    setDayOrders(found)
  }

  function prevMonth() {
    setCalMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))
    setSelectedDay(null)
  }

  function nextMonth() {
    setCalMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))
    setSelectedDay(null)
  }

  const year       = calMonth.getFullYear()
  const month      = calMonth.getMonth()
  const firstDay   = new Date(year, month, 1).getDay()
  const totalDays  = new Date(year, month + 1, 0).getDate()
  const todayStr   = new Date().toISOString().split('T')[0]

  // Month summary stats
  const monthOrders = orders.filter(o => {
    const d = new Date(o.date)
    return d.getMonth() === month && d.getFullYear() === year && o.status !== 'Cancelled'
  })
  const monthRevenue = monthOrders.reduce((s, o) => s + Number(o.total || 0), 0)

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text3)' }}>
      Loading...
    </div>
  )

  return (
    <div className="page">

      {/* Month Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button
          onClick={prevMonth}
          style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 10px', color: 'var(--text2)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <MdChevronLeft size={20} />
        </button>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 800, fontFamily: 'Syne, sans-serif' }}>
            {MONTHS[month]} {year}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>
            {monthOrders.length} shoots • ₹{(monthRevenue / 1000).toFixed(1)}k
          </div>
        </div>

        <button
          onClick={nextMonth}
          style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 10px', color: 'var(--text2)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <MdChevronRight size={20} />
        </button>
      </div>

      {/* Day Headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: 'var(--text3)', padding: '4px 0' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3, marginBottom: 20 }}>
        {/* Empty cells */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {/* Day cells */}
        {Array.from({ length: totalDays }).map((_, i) => {
          const day     = i + 1
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const dayOs   = getOrdersOnDate(year, month, day)
          const isToday = dateStr === todayStr
          const isSelected = dateStr === selectedDay
          const hasShoots   = dayOs.length > 0

          return (
            <div
              key={day}
              onClick={() => handleDayClick(day)}
              style={{
                background: isSelected ? '#6366f133' : isToday ? '#6366f118' : hasShoots ? 'var(--bg3)' : 'transparent',
                border: isSelected ? '1px solid var(--purple)' : isToday ? '1px solid #6366f155' : hasShoots ? '1px solid var(--border)' : '1px solid transparent',
                borderRadius: 10,
                minHeight: 52,
                padding: '4px 3px',
                cursor: hasShoots ? 'pointer' : 'default',
                transition: 'all 0.15s',
              }}
            >
              <div style={{
                fontSize: 12,
                fontWeight: isToday ? 800 : 500,
                color: isToday ? 'var(--purple2)' : isSelected ? 'var(--purple2)' : 'var(--text2)',
                textAlign: 'center',
                marginBottom: 2,
              }}>
                {day}
              </div>

              {/* Shoot dots */}
              {dayOs.slice(0, 3).map((o, idx) => (
                <div
                  key={idx}
                  style={{
                    background: STATUS_COLORS[o.status] + '33',
                    color: STATUS_COLORS[o.status],
                    fontSize: 8,
                    borderRadius: 4,
                    padding: '1px 3px',
                    marginBottom: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontWeight: 600,
                  }}
                >
                  {o.clientName.split(' ')[0]}
                </div>
              ))}
              {dayOs.length > 3 && (
                <div style={{ fontSize: 8, color: 'var(--text3)', textAlign: 'center' }}>
                  +{dayOs.length - 3}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Selected Day Detail */}
      {selectedDay && (
        <div style={{
          background: 'var(--bg3)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          overflow: 'hidden',
          marginBottom: 20,
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '12px 16px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--bg2)',
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>
                {formatDate(selectedDay)}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                {dayOrders.length} shoot{dayOrders.length !== 1 ? 's' : ''}
              </div>
            </div>
            <button
              onClick={() => setSelectedDay(null)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text3)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <MdClose size={18} />
            </button>
          </div>

          {dayOrders.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>
              Is din koi shoot nahi 😴
            </div>
          ) : (
            dayOrders.map((o, i) => (
              <div
                key={o.id}
                style={{
                  padding: '12px 16px',
                  borderBottom: i < dayOrders.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{o.clientName}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)' }}>{o.shootType}</div>
                  </div>
                  <span style={{
                    background: (STATUS_COLORS[o.status] || '#64748b') + '20',
                    color: STATUS_COLORS[o.status] || '#64748b',
                    padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600,
                  }}>
                    {o.status}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text2)', flexWrap: 'wrap' }}>
                  {o.time  && <span>⏰ {o.time}</span>}
                  {o.venue && <span>📍 {o.venue}</span>}
                  {o.phone && <span>📞 {o.phone}</span>}
                </div>

                {o.team?.length > 0 && (
                  <div style={{ fontSize: 11, color: 'var(--purple2)', marginTop: 6 }}>
                    👥 {o.team.join(', ')}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--text3)' }}>
                    Advance: ₹{Number(o.advance || 0).toLocaleString()}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#10b981' }}>
                    ₹{Number(o.total || 0).toLocaleString()}
                  </span>
                </div>

                {o.notes && (
                  <div style={{
                    marginTop: 8, background: 'var(--bg2)',
                    borderRadius: 8, padding: '6px 10px',
                    fontSize: 12, color: 'var(--text3)', lineHeight: 1.5,
                  }}>
                    📝 {o.notes}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* This Month List */}
      <div className="section-title">Is Mahine ke Sab Orders</div>
      {monthOrders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 24, color: 'var(--text3)', fontSize: 13 }}>
          Is mahine koi order nahi
        </div>
      ) : (
        monthOrders
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .map(o => {
            const diff = getDaysDiff(o.date)
            return (
              <div
                key={o.id}
                onClick={() => handleDayClick(Number(o.date.split('-')[2]))}
                style={{
                  background: 'var(--bg3)',
                  border: `1px solid ${diff === 0 ? '#ef444433' : diff === 1 ? '#f59e0b33' : 'var(--border)'}`,
                  borderRadius: 12, padding: '12px 14px',
                  marginBottom: 8, cursor: 'pointer',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{o.clientName}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                    {o.shootType} • {new Date(o.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} {o.time && `• ${o.time}`}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#10b981' }}>
                    ₹{Number(o.total || 0).toLocaleString()}
                  </div>
                  <span style={{
                    background: (STATUS_COLORS[o.status] || '#64748b') + '20',
                    color: STATUS_COLORS[o.status] || '#64748b',
                    padding: '1px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600,
                  }}>
                    {o.status}
                  </span>
                </div>
              </div>
            )
          })
      )}
    </div>
  )
}