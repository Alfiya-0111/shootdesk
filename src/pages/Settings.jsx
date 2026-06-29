import { useState, useEffect } from 'react'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { MdLogout, MdSave, MdBusiness, MdPerson, MdPhone, MdLocationOn } from 'react-icons/md'

// WhatsApp SVG icon (react-icons mein nahi hai)
function WhatsAppIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.134 1.585 5.934L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

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
    whatsappReminders: false,
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
        whatsappReminders: studioData.whatsappReminders || false,
      })
    }
  }, [studioData])

  async function handleSave() {
    setSaving(true)
    try {
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

      {/* WhatsApp Reminders */}
      <div style={{
        background: 'var(--bg3)', border: '1px solid var(--border)',
        borderRadius: 14, padding: 16, marginBottom: 14,
      }}>
        <div style={{
          fontSize: 13, fontWeight: 700, color: 'var(--purple2)',
          marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <WhatsAppIcon size={16} /> WhatsApp Reminders
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Auto Reminders</div>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>Client ko WhatsApp pe shoot reminder</div>
          </div>
          
          <button
            onClick={() => setForm(p => ({ ...p, whatsappReminders: !p.whatsappReminders }))}
            style={{
              width: 44,
              height: 24,
              borderRadius: 12,
              border: 'none',
              background: form.whatsappReminders ? 'var(--purple)' : 'var(--bg2)',
              position: 'relative',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <div style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: '#fff',
              position: 'absolute',
              top: 2,
              left: form.whatsappReminders ? 22 : 2,
              transition: 'all 0.2s',
            }} />
          </button>
        </div>
        
        {form.whatsappReminders && (
          <div style={{ fontSize: 12, color: '#10b981', marginTop: 8 }}>
            ✅ Pro plan active — WhatsApp reminders enabled
          </div>
        )}
        
        {!form.whatsappReminders && studioData?.plan !== 'pro' && studioData?.plan !== 'studio' && (
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 8 }}>
            🔒 Pro plan required for WhatsApp reminders
          </div>
        )}
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
          Plan: <span style={{ color: '#10b981', fontWeight: 700 }}>{studioData?.plan || 'Free'}</span>
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