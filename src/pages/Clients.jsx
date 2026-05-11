import { useState, useEffect } from 'react'
import { collection, query, getDocs, orderBy } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import { MdPhone, MdSearch, MdStar } from 'react-icons/md'

export default function Clients() {
  const { currentUser } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => { fetchOrders() }, [])

  async function fetchOrders() {
    try {
      const q = query(
        collection(db, 'studios', currentUser.uid, 'orders'),
        orderBy('date', 'desc')
      )
      const snap = await getDocs(q)
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  // Group orders by client phone or name
  const clientMap = {}
  orders.forEach(o => {
    const key = o.phone || o.clientName
    if (!clientMap[key]) {
      clientMap[key] = {
        name: o.clientName,
        phone: o.phone,
        shoots: [],
        totalSpent: 0,
      }
    }
    clientMap[key].shoots.push(o)
    clientMap[key].totalSpent += Number(o.total || 0)
  })

  const clients = Object.values(clientMap)
    .filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search)
    )
    .sort((a, b) => b.totalSpent - a.totalSpent)

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text3)' }}>
      Loading...
    </div>
  )

  // Client Detail
  if (selected) return (
    <div className="page">
      <button
        onClick={() => setSelected(null)}
        style={{ background: 'transparent', border: 'none', color: 'var(--purple2)', cursor: 'pointer', fontSize: 14, marginBottom: 16 }}
      >
        ← Back
      </button>

      <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 18, padding: 20, marginBottom: 16 }}>
        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 800, color: '#fff',
          }}>
            {selected.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{selected.name}</div>
            {selected.phone && (
              <div style={{ fontSize: 13, color: 'var(--text3)' }}>{selected.phone}</div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
          {[
            ['Shoots', selected.shoots.length, '#6366f1'],
            ['Spent', `₹${(selected.totalSpent / 1000).toFixed(1)}k`, '#10b981'],
            ['Status', selected.shoots.filter(s => s.status === 'Completed').length + ' done', '#f59e0b'],
          ].map(([label, val, color]) => (
            <div key={label} style={{
              background: 'var(--bg2)', borderRadius: 10, padding: 10, textAlign: 'center',
            }}>
              <div style={{ fontSize: 16, fontWeight: 800, color }}>{val}</div>
              <div style={{ fontSize: 10, color: 'var(--text3)' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Call Button */}
        {selected.phone && (
          <a href={`tel:${selected.phone}`} style={{ textDecoration: 'none' }}>
            <button style={{
              width: '100%', background: '#10b98120',
              border: '1px solid #10b98133', borderRadius: 10,
              padding: '11px 0', color: '#10b981',
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <MdPhone size={16} /> Call Client
            </button>
          </a>
        )}
      </div>

      {/* Shoot History */}
      <div className="section-title">Shoot History</div>
      {selected.shoots.map(o => (
        <div key={o.id} style={{
          background: 'var(--bg3)', border: '1px solid var(--border)',
          borderRadius: 12, padding: '12px 14px', marginBottom: 8,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{o.shootType}</div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                {new Date(o.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                {o.venue && ` • ${o.venue}`}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700, color: '#10b981', fontSize: 13 }}>
                ₹{Number(o.total || 0).toLocaleString()}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                Adv: ₹{Number(o.advance || 0).toLocaleString()}
              </div>
            </div>
          </div>
          {o.notes && (
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 6, fontStyle: 'italic' }}>
              "{o.notes}"
            </div>
          )}
        </div>
      ))}
    </div>
  )

  // List View
  return (
    <div className="page">
      <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Clients</h2>

      <div style={{ position: 'relative', marginBottom: 16 }}>
        <MdSearch size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
        <input
          className="input"
          placeholder="Search by name or phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ paddingLeft: 36 }}
        />
      </div>

      <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 12 }}>
        {clients.length} unique client{clients.length !== 1 ? 's' : ''}
      </div>

      {clients.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>👥</div>
          <div>Koi client nahi mila</div>
        </div>
      ) : (
        clients.map((c, i) => (
          <div
            key={i}
            onClick={() => setSelected(c)}
            style={{
              background: 'var(--bg3)', border: '1px solid var(--border)',
              borderRadius: 14, padding: '14px', marginBottom: 10, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 12,
            }}
          >
            {/* Avatar */}
            <div style={{
              width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 800, color: '#fff',
            }}>
              {c.name.charAt(0).toUpperCase()}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{c.name}</div>
                {c.shoots.length >= 2 && (
                  <span style={{
                    background: '#f59e0b20', color: '#f59e0b',
                    padding: '1px 6px', borderRadius: 20, fontSize: 10, fontWeight: 700,
                    display: 'flex', alignItems: 'center', gap: 2,
                  }}>
                    <MdStar size={10} /> Repeat
                  </span>
                )}
              </div>
              {c.phone && (
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>{c.phone}</div>
              )}
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#10b981' }}>
                ₹{(c.totalSpent / 1000).toFixed(1)}k
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                {c.shoots.length} shoot{c.shoots.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}