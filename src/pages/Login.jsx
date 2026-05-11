import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!form.email || !form.password) return setError('Sab fields bharo')
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/app/dashboard')
    } catch (e) {
      setError('Email ya password galat hai')
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
        Apne studio mein login karo
      </div>

      <div style={{
        background: 'var(--bg3)',
        border: '1px solid var(--border)',
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 400,
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>Welcome Back 👋</h2>

        {error && <div className="error-msg">{error}</div>}

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
          placeholder="••••••••"
          value={form.password}
          onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          style={{ marginBottom: 20 }}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
        />

        <button
          className="btn-primary"
          onClick={handleLogin}
          disabled={loading}
          style={{ opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Logging in...' : 'Login →'}
        </button>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--text3)' }}>
          Account nahi hai?{' '}
          <Link to="/signup" style={{ color: 'var(--purple2)', fontWeight: 600 }}>
            Free Signup
          </Link>
        </div>
      </div>

      <Link to="/" style={{ marginTop: 20, fontSize: 13, color: 'var(--text3)' }}>
        ← Back to Home
      </Link>
    </div>
  )
}