import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { MdLock, MdArrowForward } from 'react-icons/md'

export default function Paywall({ reason }) {
  const navigate = useNavigate()

  const messages = {
    trialExpired: '⏰ Aapka free trial khatam ho gaya!',
    orderLimit: '📊 50 orders ka limit pura ho gaya!',
    featureLocked: '🔒 Yeh feature sirf Pro plan mein hai!',
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#000000ee',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 24,
    }}>
      <div style={{
        background: 'var(--bg3)',
        border: '1px solid var(--border)',
        borderRadius: 20,
        padding: 32,
        width: '100%',
        maxWidth: 340,
        textAlign: 'center',
      }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <MdLock size={32} color="#fff" />
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>
          {messages[reason] || 'Upgrade Required'}
        </h2>

        <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 24, lineHeight: 1.6 }}>
          {reason === 'trialExpired' 
            ? 'Pro plan mein unlimited orders, WhatsApp reminders, aur PDF invoices milte hain.'
            : 'Free plan mein 50 orders ka limit hai. Pro plan se unlimited orders add karo.'}
        </p>

        <div style={{
          background: 'var(--bg2)',
          borderRadius: 12,
          padding: 14,
          marginBottom: 20,
        }}>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>Pro Plan</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981' }}>
            ₹99<span style={{ fontSize: 14, color: 'var(--text3)' }}>/month</span>
          </div>
        </div>

        <button
          onClick={() => navigate('/app/subscription')}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            border: 'none',
            borderRadius: 12,
            padding: '14px 0',
            color: '#fff',
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            marginBottom: 12,
          }}
        >
          Upgrade Now <MdArrowForward size={18} />
        </button>

        <button
          onClick={() => navigate('/app/dashboard')}
          style={{
            width: '100%',
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '12px 0',
            color: 'var(--text3)',
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  )
}