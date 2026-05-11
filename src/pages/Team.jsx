import { useState, useEffect } from 'react'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import { MdAdd, MdDelete, MdPerson } from 'react-icons/md'

export default function Team() {
  const { currentUser } = useAuth()
  const [members, setMembers] = useState([])
  const [newName, setNewName] = useState('')
  const [newRole, setNewRole] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchTeam() }, [])

  async function fetchTeam() {
    try {
      const snap = await getDoc(doc(db, 'studios', currentUser.uid))
      if (snap.exists() && snap.data().team) {
        setMembers(snap.data().team)
      }
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  async function saveTeam(updated) {
    setSaving(true)
    try {
      await updateDoc(doc(db, 'studios', currentUser.uid), { team: updated })
      setMembers(updated)
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  function addMember() {
    const name = newName.trim()
    if (!name) return
    const member = { name, role: newRole.trim() || 'Photographer', addedAt: Date.now() }
    saveTeam([...members, member])
    setNewName('')
    setNewRole('')
  }

  function removeMember(idx) {
    if (!window.confirm('Is member ko remove karna chahte ho?')) return
    saveTeam(members.filter((_, i) => i !== idx))
  }

  const ROLE_COLORS = {
    Photographer: '#6366f1',
    Videographer: '#3b82f6',
    Editor: '#10b981',
    Assistant: '#f59e0b',
    Other: '#94a3b8',
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text3)' }}>
      Loading...
    </div>
  )

  return (
    <div className="page">
      <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>Team</h2>
      <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 20 }}>
        {members.length} member{members.length !== 1 ? 's' : ''}
      </div>

      {/* Add Member */}
      <div style={{
        background: 'var(--bg3)', border: '1px solid var(--border)',
        borderRadius: 14, padding: 16, marginBottom: 20,
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--purple2)', marginBottom: 12 }}>
          ➕ Naya Member Add Karo
        </div>

        <label className="label">Name</label>
        <input
          className="input"
          placeholder="Member ka naam"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          style={{ marginBottom: 10 }}
          onKeyDown={e => e.key === 'Enter' && addMember()}
        />

        <label className="label">Role</label>
        <select
          className="input"
          value={newRole}
          onChange={e => setNewRole(e.target.value)}
          style={{ marginBottom: 14 }}
        >
          <option value="">Select Role</option>
          <option>Photographer</option>
          <option>Videographer</option>
          <option>Editor</option>
          <option>Assistant</option>
          <option>Other</option>
        </select>

        <button
          onClick={addMember}
          disabled={saving || !newName.trim()}
          style={{
            width: '100%', background: 'var(--purple)', border: 'none',
            borderRadius: 10, padding: '11px 0', color: '#fff',
            fontSize: 14, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            opacity: !newName.trim() ? 0.5 : 1,
          }}
        >
          <MdAdd size={18} /> Add Member
        </button>
      </div>

      {/* Members List */}
      <div className="section-title">Team Members</div>

      {members.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>👥</div>
          <div>Abhi koi team member nahi</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Upar se add karo</div>
        </div>
      ) : (
        members.map((m, i) => (
          <div
            key={i}
            style={{
              background: 'var(--bg3)', border: '1px solid var(--border)',
              borderRadius: 14, padding: '14px 16px', marginBottom: 10,
              display: 'flex', alignItems: 'center', gap: 12,
            }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: (ROLE_COLORS[m.role] || '#64748b') + '30',
              border: `2px solid ${ROLE_COLORS[m.role] || '#64748b'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: ROLE_COLORS[m.role] || '#64748b', flexShrink: 0,
            }}>
              <MdPerson size={22} />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{m.name}</div>
              <span style={{
                background: (ROLE_COLORS[m.role] || '#64748b') + '20',
                color: ROLE_COLORS[m.role] || '#64748b',
                padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600,
              }}>
                {m.role || 'Photographer'}
              </span>
            </div>

            <button
              onClick={() => removeMember(i)}
              style={{
                background: '#ef44441a', border: '1px solid #ef444433',
                borderRadius: 8, padding: '6px 8px', color: '#ef4444',
                cursor: 'pointer', display: 'flex', alignItems: 'center',
              }}
            >
              <MdDelete size={16} />
            </button>
          </div>
        ))
      )}
    </div>
  )
}