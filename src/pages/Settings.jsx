import { useState, useEffect } from 'react'
import { doc, setDoc } from 'firebase/firestore'  // updateDoc hatao, setDoc import karo
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { MdLogout, MdSave, MdBusiness, MdPerson, MdPhone, MdLocationOn } from 'react-icons/md'

export default function Settings() {
  const { currentUser, studioData, setStudioData, logout } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    studioName: '',
    ownerName: '',
    phone: '',
    address: '',
    city: '',
    instagram: '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (studioData) {
      setForm({
        studioName: studioData.studioName || '',
        ownerName: studioData.ownerName || '',
        phone: studioData.phone || '',
        address: studioData.address || '',
        city: studioData.city || '',
        instagram: studioData.instagram || '',
      })
    }
  }, [studioData])

  async function handleSave() {
    setSaving(true)
    try {
      // setDoc with merge:true — document exist kare ya na kare, dono case handle karta hai
      await setDoc(doc(db, 'studios', currentUser.uid), form, { merge: true })
      setStudioData(prev => ({ ...prev, ...form }))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) { 
      console.error(e) 
    }
    setSaving(false)
  }

  async function handleLogout() {
    if (!window.confirm('Logout karna chahte ho?')) return
    await logout()
    navigate('/')
  }

  const f = field => ({
    value: form[field],
    onChange: e => setForm(p => ({ ...p, [field]: e.target.value }))
  })

  return (
    <div className="page">
      <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>Settings</h2>

      {/* Studio Info */}
      <div style={{
        background: 'var(--bg3)', border: '1px solid var(--border)',
        borderRadius: 14, padding: 16, marginBottom: 14,
      }}>
        <div style={{
          fontSize: 13, fontWeight: 700, color: 'var(--purple2)',
          marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <MdBusiness size={16} /> Studio Info
        </div>

        <label className="label">Studio Name</label>
        <input className="input" placeholder="Sharma Photography" style={{ marginBottom: 12 }} {...f('studioName')} />

        <label className="label">City</label>
        <input className="input" placeholder="Surat, Navsari, Bilimora..." style={{ marginBottom: 0 }} {...f('city')} />
      </div>

      {/* Owner Info */}
      <div style={{
        background: 'var(--bg3)', border: '1px solid var(--border)',
        borderRadius: 14, padding: 16, marginBottom: 14,
      }}>
        <div style={{
          fontSize: 13, fontWeight: 700, color: 'var(--purple2)',
          marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <MdPerson size={16} /> Owner Info
        </div>

        <label className="label">Owner Name</label>
        <input className="input" placeholder="Tumhara naam" style={{ marginBottom: 12 }} {...f('ownerName')} />

        <label className="label">Phone Number</label>
        <input className="input" type="tel" placeholder="Mobile number" style={{ marginBottom: 12 }} {...f('phone')} />

        <label className="label">Instagram Handle</label>
        <input className="input" placeholder="@yourstudio" style={{ marginBottom: 0 }} {...f('instagram')} />
      </div>

      {/* Address */}
      <div style={{
        background: 'var(--bg3)', border: '1px solid var(--border)',
        borderRadius: 14, padding: 16, marginBottom: 14,
      }}>
        <div style={{
          fontSize: 13, fontWeight: 700, color: 'var(--purple2)',
          marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <MdLocationOn size={16} /> Studio Address
        </div>

        <label className="label">Full Address</label>
        <textarea
          className="input"
          placeholder="Studio ka address..."
          rows={3}
          style={{ resize: 'vertical', marginBottom: 0 }}
          {...f('address')}
        />
      </div>

      {/* Account Info */}
      <div style={{
        background: 'var(--bg3)', border: '1px solid var(--border)',
        borderRadius: 14, padding: 16, marginBottom: 20,
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--purple2)', marginBottom: 10 }}>
          Account
        </div>
        <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 4 }}>
          Email: <span style={{ color: 'var(--text)' }}>{currentUser?.email}</span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text2)' }}>
          Plan: <span style={{ color: '#10b981', fontWeight: 700 }}>Free</span>
        </div>
      </div>

      {/* Save Button */}
      {saved && (
        <div style={{
          background: '#10b98115', border: '1px solid #10b98133',
          borderRadius: 10, padding: '10px 14px',
          color: '#10b981', fontSize: 13, fontWeight: 600,
          marginBottom: 12, textAlign: 'center',
        }}>
          ✅ Settings save ho gayi!
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          width: '100%', background: 'var(--purple)', border: 'none',
          borderRadius: 10, padding: '12px 0', color: '#fff',
          fontSize: 14, fontWeight: 700, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          marginBottom: 12, opacity: saving ? 0.7 : 1,
        }}
      >
        <MdSave size={18} /> {saving ? 'Saving...' : 'Save Settings'}
      </button>

      <button
        onClick={handleLogout}
        style={{
          width: '100%', background: '#ef44441a',
          border: '1px solid #ef444433', borderRadius: 10,
          padding: '12px 0', color: '#ef4444',
          fontSize: 14, fontWeight: 700, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}
      >
        <MdLogout size={18} /> Logout
      </button>
    </div>
  )
}