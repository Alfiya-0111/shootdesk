import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    studioName: '',
    ownerName: '',
    email: '',
    password: '',
    confirm: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignup() {
    if (!form.studioName || !form.ownerName || !form.email || !form.password)
      return setError('Sab fields bharo')
    if (form.password.length < 6)
      return setError('Password kam se kam 6 characters ka hona chahiye')
    if (form.password !== form.confirm)
      return setError('Passwords match nahi kar rahe')

    setError('')
    setLoading(true)
    try {
      await signup(form.email, form.password, form.studioName, form.ownerName)
      navigate('/app/dashboard')
    } catch (e) {
      if (e.code === 'auth/email-already-in-use') {
        setError('Ye email pehle se registered hai')
      } else {
        setError('Kuch galat hua, dobara try karo')
      }
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      {/* Logo */}
      <div style={{
        fontSize: 24,
        fontWeight: 800,
        fontFamily: 'Syne, sans-serif',
        background: 'linear-gradient(90deg, #c084fc, #818cf8)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: 8,
      }}>
        📸 ShootDesk
      </div>
      <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 32 }}>
        Apna studio register karo — bilkul free
      </div>

      <div style={{
        background: 'var(--bg3)',
        border: '1px solid var(--border)',
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 400,
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>Studio Create Karo 🎬</h2>

        {error && <div className="error-msg">{error}</div>}

        <label className="label">Studio Name</label>
        <input
          className="input"
          placeholder="Jaise: Sharma Photography"
          value={form.studioName}
          onChange={e => setForm(f => ({ ...f, studioName: e.target.value }))}
          style={{ marginBottom: 14 }}
        />

        <label className="label">Owner Name</label>
        <input
          className="input"
          placeholder="Tumhara naam"
          value={form.ownerName}
          onChange={e => setForm(f => ({ ...f, ownerName: e.target.value }))}
          style={{ marginBottom: 14 }}
        />

        <label className="label">Email</label>
        <input
          className="input"
          type="email"
          placeholder="studio@email.com"
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          style={{ marginBottom: 14 }}
        />

        <label className="label">Password</label>
        <input
          className="input"
          type="password"
          placeholder="Min 6 characters"
          value={form.password}
          onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          style={{ marginBottom: 14 }}
        />

        <label className="label">Confirm Password</label>
        <input
          className="input"
          type="password"
          placeholder="Dobara likho"
          value={form.confirm}
          onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
          style={{ marginBottom: 20 }}
          onKeyDown={e => e.key === 'Enter' && handleSignup()}
        />

        <button
          className="btn-primary"
          onClick={handleSignup}
          disabled={loading}
          style={{ opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Creating Studio...' : 'Studio Banao →'}
        </button>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--text3)' }}>
          Pehle se account hai?{' '}
          <Link to="/login" style={{ color: 'var(--purple2)', fontWeight: 600 }}>
            Login karo
          </Link>
        </div>
      </div>

      <Link to="/" style={{ marginTop: 20, fontSize: 13, color: 'var(--text3)' }}>
        ← Back to Home
      </Link>
    </div>
  )
}