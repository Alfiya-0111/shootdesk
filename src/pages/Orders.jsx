import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { collection, query, getDocs, doc, deleteDoc, orderBy } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import { generateInvoice, shareInvoice } from '../services/InvoiceService'
import { MdAdd, MdEdit, MdDelete, MdPhone, MdLocationOn, MdSearch, MdPictureAsPdf } from 'react-icons/md'

// WhatsApp icon SVG component (react-icons mein nahi hai)
function WhatsAppIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.134 1.585 5.934L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

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
  const { currentUser, studioData } = useAuth()
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

        {/* Invoice & Share */}
        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
          <button
            onClick={() => generateInvoice(selected, studioData)}
            style={{
              flex: 1,
              background: '#6366f120',
              border: '1px solid #6366f133',
              borderRadius: 10,
              padding: '11px 0',
              color: '#6366f1',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <MdPictureAsPdf size={16} /> Download Invoice
          </button>
          
          {selected.phone && (
            <button
              onClick={() => {
                const { whatsappUrl } = shareInvoice(selected, studioData)
                window.open(whatsappUrl, '_blank')
              }}
              style={{
                flex: 1,
                background: '#25D36620',
                border: '1px solid #25D36633',
                borderRadius: 10,
                padding: '11px 0',
                color: '#25D366',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <WhatsAppIcon size={16} /> Share Invoice
            </button>
          )}
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