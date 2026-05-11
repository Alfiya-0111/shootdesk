import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { collection, query, getDocs, doc, deleteDoc, orderBy } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import { MdAdd, MdEdit, MdDelete, MdPhone, MdLocationOn, MdSearch } from 'react-icons/md'

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
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  })
}

function DayBadge({ dateStr }) {
  const diff = getDaysDiff(dateStr)
  if (diff < 0)   return <span style={{ background: '#1f1f2e', color: '#6b7280', padding: '2px 8px', borderRadius: 20, fontSize: 10 }}>Past</span>
  if (diff === 0)  return <span style={{ background: '#ef44441a', color: '#ef4444', padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700 }}>TODAY</span>
  if (diff === 1)  return <span style={{ background: '#f59e0b1a', color: '#f59e0b', padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700 }}>Tomorrow</span>
  return <span style={{ background: '#3b82f61a', color: '#60a5fa', padding: '2px 8px', borderRadius: 20, fontSize: 10 }}>In {diff}d</span>
}

export default function Orders() {
  const { currentUser } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [deleting, setDeleting] = useState(false)

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

  async function handleDelete(id) {
    if (!window.confirm('Ye order delete karna chahte ho?')) return
    setDeleting(true)
    try {
      await deleteDoc(doc(db, 'studios', currentUser.uid, 'orders', id))
      setOrders(prev => prev.filter(o => o.id !== id))
      setSelected(null)
    } catch (e) { console.error(e) }
    setDeleting(false)
  }

  const filtered = orders.filter(o => {
    const matchSearch = o.clientName?.toLowerCase().includes(search.toLowerCase()) ||
      o.shootType?.toLowerCase().includes(search.toLowerCase()) ||
      o.venue?.toLowerCase().includes(search.toLowerCase())
    const matchFilter =
      filter === 'all' ? true :
      filter === 'upcoming' ? getDaysDiff(o.date) >= 0 && o.status !== 'Cancelled' && o.status !== 'Completed' :
      o.status === filter
    return matchSearch && matchFilter
  })

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text3)' }}>
      Loading...
    </div>
  )

  // Detail View
  if (selected) return (
    <div className="page">
      <button
        onClick={() => setSelected(null)}
        style={{ background: 'transparent', border: 'none', color: 'var(--purple2)', cursor: 'pointer', fontSize: 14, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 4 }}
      >
        ← Back
      </button>

      <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 18, padding: 20 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{selected.clientName}</div>
            <div style={{ fontSize: 14, color: 'var(--purple2)', fontWeight: 600 }}>{selected.shootType}</div>
          </div>
          <DayBadge dateStr={selected.date} />
        </div>

        <span style={{
          background: (STATUS_COLORS[selected.status] || '#64748b') + '20',
          color: STATUS_COLORS[selected.status] || '#64748b',
          padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
        }}>
          {selected.status}
        </span>

        {/* Details */}
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            ['📅', 'Date', formatDate(selected.date)],
            ['⏰', 'Time', selected.time || '—'],
            ['📍', 'Venue', selected.venue || '—'],
            ['📞', 'Phone', selected.phone || '—'],
          ].map(([icon, label, val]) => (
            <div key={label} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 18 }}>{icon}</span>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{label}</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{val}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Payment */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
          gap: 10, marginTop: 16,
          background: 'var(--bg2)', borderRadius: 12, padding: 12,
        }}>
          {[
            ['Total', selected.total, '#10b981'],
            ['Advance', selected.advance, '#f59e0b'],
            ['Balance', Number(selected.total || 0) - Number(selected.advance || 0), '#ef4444'],
          ].map(([label, val, color]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color }}>₹{Number(val || 0).toLocaleString()}</div>
              <div style={{ fontSize: 10, color: 'var(--text3)' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Team */}
        {selected.team?.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 6 }}>Team</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {selected.team.map(m => (
                <span key={m} style={{ background: '#6366f120', color: 'var(--purple2)', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{m}</span>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {selected.notes && (
          <div style={{ marginTop: 14, background: 'var(--bg2)', borderRadius: 10, padding: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>Notes</div>
            <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{selected.notes}</div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <Link to={`/app/orders/edit/${selected.id}`} style={{ flex: 1 }}>
            <button style={{
              width: '100%', background: 'var(--purple)', border: 'none',
              borderRadius: 10, padding: '11px 0', color: '#fff',
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <MdEdit size={16} /> Edit
            </button>
          </Link>
          <button
            onClick={() => handleDelete(selected.id)}
            disabled={deleting}
            style={{
              flex: 1, background: '#ef44441a', border: '1px solid #ef444433',
              borderRadius: 10, padding: '11px 0', color: '#ef4444',
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            <MdDelete size={16} /> Delete
          </button>
        </div>

        {/* Call Button */}
        {selected.phone && (
          <a href={`tel:${selected.phone}`} style={{ textDecoration: 'none' }}>
            <button style={{
              width: '100%', marginTop: 10,
              background: '#10b98120', border: '1px solid #10b98133',
              borderRadius: 10, padding: '11px 0', color: '#10b981',
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <MdPhone size={16} /> Call Client
            </button>
          </a>
        )}
      </div>
    </div>
  )

  // List View
  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800 }}>Orders</h2>
        <Link to="/app/orders/add">
          <button style={{
            background: 'var(--purple)', border: 'none', borderRadius: 10,
            padding: '8px 14px', color: '#fff', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <MdAdd size={16} /> Add
          </button>
        </Link>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 12 }}>
        <MdSearch size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
        <input
          className="input"
          placeholder="Search client, shoot type, venue..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ paddingLeft: 36 }}
        />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
        {['all', 'upcoming', 'Confirmed', 'Advance Paid', 'Completed', 'Cancelled'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              background: filter === f ? 'var(--purple)' : 'var(--bg3)',
              border: '1px solid var(--border)',
              borderRadius: 20, padding: '5px 12px',
              color: filter === f ? '#fff' : 'var(--text3)',
              fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap',
              fontWeight: filter === f ? 700 : 400,
            }}
          >
            {f === 'all' ? 'All' : f}
          </button>
        ))}
      </div>

      {/* Count */}
      <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 12 }}>
        {filtered.length} order{filtered.length !== 1 ? 's' : ''} found
      </div>

      {/* Orders */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
          <div>Koi order nahi mila</div>
        </div>
      ) : (
        filtered.map(o => (
          <div
            key={o.id}
            onClick={() => setSelected(o)}
            style={{
              background: 'var(--bg3)',
              border: `1px solid ${getDaysDiff(o.date) === 0 ? '#ef444433' : getDaysDiff(o.date) === 1 ? '#f59e0b33' : 'var(--border)'}`,
              borderRadius: 14, padding: 14, marginBottom: 10, cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{o.clientName}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>{o.shootType}</div>
              </div>
              <DayBadge dateStr={o.date} />
            </div>

            <div style={{ display: 'flex', gap: 10, fontSize: 12, color: 'var(--text2)', flexWrap: 'wrap' }}>
              <span>📅 {formatDate(o.date)}</span>
              {o.time && <span>⏰ {o.time}</span>}
            </div>

            {o.venue && (
              <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                <MdLocationOn size={12} /> {o.venue}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
              <span style={{
                background: (STATUS_COLORS[o.status] || '#64748b') + '20',
                color: STATUS_COLORS[o.status] || '#64748b',
                padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
              }}>
                {o.status}
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#10b981' }}>
                ₹{Number(o.total || 0).toLocaleString()}
              </span>
            </div>

            {o.team?.length > 0 && (
              <div style={{ fontSize: 11, color: 'var(--purple2)', marginTop: 6 }}>
                👥 {o.team.join(', ')}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}