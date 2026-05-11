import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'

const SHOOT_TYPES = ['Wedding', 'Pre-Wedding', 'Birthday', 'Product', 'Portrait', 'Baby Shower', 'Maternity', 'Corporate', 'Fashion', 'Event', 'Other']
const STATUSES = ['Confirmed', 'Advance Paid', 'Pending', 'Completed', 'Cancelled']

export default function AddOrder() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [form, setForm] = useState({
    clientName: '', phone: '', shootType: 'Wedding',
    date: '', time: '', venue: '',
    advance: '', total: '', status: 'Confirmed',
    team: [], notes: '',
  })
  const [teamInput, setTeamInput] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isEdit) fetchOrder()
  }, [id])

  async function fetchOrder() {
    try {
      const snap = await getDoc(doc(db, 'studios', currentUser.uid, 'orders', id))
      if (snap.exists()) setForm({ ...snap.data() })
    } catch (e) { console.error(e) }
  }

  function addTeamMember() {
    const name = teamInput.trim()
    if (!name || form.team.includes(name)) return
    setForm(f => ({ ...f, team: [...f.team, name] }))
    setTeamInput('')
  }

  function removeTeamMember(name) {
    setForm(f => ({ ...f, team: f.team.filter(m => m !== name) }))
  }

  async function handleSave() {
    if (!form.clientName || !form.date) return setError('Client naam aur date zaroori hai')
    setError('')
    setLoading(true)
    try {
      const data = {
        ...form,
        advance: Number(form.advance || 0),
        total: Number(form.total || 0),
        updatedAt: Date.now(),
      }
      if (isEdit) {
        await updateDoc(doc(db, 'studios', currentUser.uid, 'orders', id), data)
      } else {
        data.createdAt = Date.now()
        await addDoc(collection(db, 'studios', currentUser.uid, 'orders'), data)
      }
      navigate('/app/orders')
    } catch (e) {
      setError('Save nahi hua, dobara try karo')
      console.error(e)
    }
    setLoading(false)
  }

  const f = (field) => ({ value: form[field], onChange: e => setForm(p => ({ ...p, [field]: e.target.value })) })

  return (
    <div className="page">
      <button
        onClick={() => navigate(-1)}
        style={{ background: 'transparent', border: 'none', color: 'var(--purple2)', cursor: 'pointer', fontSize: 14, marginBottom: 16 }}
      >
        ← Back
      </button>

      <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>
        {isEdit ? '✏️ Order Edit Karo' : '➕ Naya Order'}
      </h2>

      {error && <div className="error-msg">{error}</div>}

      {/* Client Info */}
      <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 14, padding: 16, marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--purple2)', marginBottom: 12 }}>👤 Client Info</div>

        <label className="label">Client Name *</label>
        <input className="input" placeholder="Client ka poora naam" style={{ marginBottom: 12 }} {...f('clientName')} />

        <label className="label">Phone Number</label>
        <input className="input" type="tel" placeholder="Mobile number" style={{ marginBottom: 0 }} {...f('phone')} />
      </div>

      {/* Shoot Details */}
      <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 14, padding: 16, marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--purple2)', marginBottom: 12 }}>📸 Shoot Details</div>

        <label className="label">Shoot Type</label>
        <select className="input" style={{ marginBottom: 12 }} {...f('shootType')}>
          {SHOOT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          <div>
            <label className="label">Date *</label>
            <input className="input" type="date" {...f('date')} />
          </div>
          <div>
            <label className="label">Time</label>
            <input className="input" type="time" {...f('time')} />
          </div>
        </div>

        <label className="label">Venue / Location</label>
        <input className="input" placeholder="Hotel, address, city..." style={{ marginBottom: 0 }} {...f('venue')} />
      </div>

      {/* Payment */}
      <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 14, padding: 16, marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--purple2)', marginBottom: 12 }}>💰 Payment</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          <div>
            <label className="label">Total Amount (₹)</label>
            <input className="input" type="number" placeholder="0" {...f('total')} />
          </div>
          <div>
            <label className="label">Advance Received (₹)</label>
            <input className="input" type="number" placeholder="0" {...f('advance')} />
          </div>
        </div>

        {/* Balance Preview */}
        {(form.total || form.advance) && (
          <div style={{ background: 'var(--bg2)', borderRadius: 10, padding: 10, textAlign: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>Balance Pending: </span>
            <span style={{ fontWeight: 800, color: '#ef4444', fontSize: 15 }}>
              ₹{(Number(form.total || 0) - Number(form.advance || 0)).toLocaleString()}
            </span>
          </div>
        )}

        <label className="label" style={{ marginTop: 12 }}>Status</label>
        <select className="input" style={{ marginBottom: 0 }} {...f('status')}>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Team */}
      <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 14, padding: 16, marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--purple2)', marginBottom: 12 }}>👥 Team</div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <input
            className="input"
            placeholder="Team member ka naam"
            value={teamInput}
            onChange={e => setTeamInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTeamMember()}
            style={{ marginBottom: 0 }}
          />
          <button
            onClick={addTeamMember}
            style={{ background: 'var(--purple)', border: 'none', borderRadius: 10, padding: '0 16px', color: '#fff', cursor: 'pointer', fontWeight: 700, whiteSpace: 'nowrap' }}
          >
            Add
          </button>
        </div>

        {form.team.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {form.team.map(m => (
              <span
                key={m}
                onClick={() => removeTeamMember(m)}
                style={{
                  background: '#6366f120', color: 'var(--purple2)',
                  padding: '4px 12px', borderRadius: 20, fontSize: 12,
                  fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                {m} ✕
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 14, padding: 16, marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--purple2)', marginBottom: 12 }}>📝 Notes</div>
        <textarea
          className="input"
          placeholder="Special requests, props, client preferences..."
          rows={4}
          style={{ resize: 'vertical', marginBottom: 0 }}
          {...f('notes')}
        />
      </div>

      {/* Save Button */}
      <button
        className="btn-primary"
        onClick={handleSave}
        disabled={loading}
        style={{ opacity: loading ? 0.7 : 1, marginBottom: 20 }}
      >
        {loading ? 'Saving...' : isEdit ? '💾 Update Order' : '💾 Order Save Karo'}
      </button>
    </div>
  )
}