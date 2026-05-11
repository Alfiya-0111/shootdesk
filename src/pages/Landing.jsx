import { Link } from 'react-router-dom'
import { MdCalendarMonth, MdNotifications, MdPeople, MdBarChart, MdCheck } from 'react-icons/md'

const features = [
  { icon: <MdCalendarMonth size={24} />, title: 'Smart Calendar', desc: 'Saare shoots ek jagah. Date clash kabhi nahi.' },
  { icon: <MdNotifications size={24} />, title: 'Auto Reminders', desc: 'Kal ka shoot? App khud yaad dilaayega.' },
  { icon: <MdPeople size={24} />, title: 'Team Management', desc: 'Kaun jaayega shoot pe — assign karo easily.' },
  { icon: <MdBarChart size={24} />, title: 'Revenue Tracking', desc: 'Advance, balance, total — sab ek nazar mein.' },
]

const benefits = [
  'Board pe likhna band karo',
  'Client details kabhi na bhoolo',
  'Team ko shoots assign karo',
  'Payments track karo',
  'Calendar se clash avoid karo',
  'Mobile se manage karo',
]

export default function Landing() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'DM Sans, sans-serif' }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        background: 'var(--bg)',
        zIndex: 100,
      }}>
        <div style={{
          fontSize: 20,
          fontWeight: 800,
          fontFamily: 'Syne, sans-serif',
          background: 'linear-gradient(90deg, #c084fc, #818cf8)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          📸 ShootDesk
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/login">
            <button style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: '8px 16px',
              color: 'var(--text2)',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
            }}>
              Login
            </button>
          </Link>
          <Link to="/signup">
            <button style={{
              background: 'var(--purple)',
              border: 'none',
              borderRadius: 10,
              padding: '8px 16px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 700,
            }}>
              Free Signup
            </button>
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div style={{
        padding: '60px 24px 40px',
        textAlign: 'center',
        background: 'radial-gradient(ellipse at 50% 0%, #6366f122 0%, transparent 70%)',
      }}>
        <div style={{
          display: 'inline-block',
          background: '#6366f120',
          border: '1px solid #6366f144',
          borderRadius: 20,
          padding: '4px 14px',
          fontSize: 12,
          color: 'var(--purple2)',
          fontWeight: 600,
          marginBottom: 20,
        }}>
          🇮🇳 Made for Indian Photography Studios
        </div>

        <h1 style={{
          fontSize: 36,
          fontWeight: 800,
          fontFamily: 'Syne, sans-serif',
          lineHeight: 1.2,
          marginBottom: 16,
        }}>
          Board pe likhna<br />
          <span style={{
            background: 'linear-gradient(90deg, #c084fc, #818cf8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            band karo ab
          </span>
        </h1>

        <p style={{
          fontSize: 16,
          color: 'var(--text2)',
          lineHeight: 1.7,
          maxWidth: 340,
          margin: '0 auto 32px',
        }}>
          Photography studio ka poora order management — shoots, team, payments, reminders — sab ek app mein.
        </p>

        <Link to="/signup">
          <button style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            border: 'none',
            borderRadius: 14,
            padding: '14px 32px',
            color: '#fff',
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 8px 32px #6366f144',
          }}>
            Free mein shuru karo →
          </button>
        </Link>

        <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text3)' }}>
          No credit card required • Setup in 2 minutes
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 32,
        padding: '20px 24px',
        background: 'var(--bg3)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}>
        {[['100+', 'Studios'], ['5000+', 'Shoots'], ['₹0', 'Cost']].map(([num, label]) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--purple2)' }}>{num}</div>
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Features */}
      <div style={{ padding: '40px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div className="section-title">Features</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, fontFamily: 'Syne, sans-serif' }}>
            Sab kuch jo chahiye
          </h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {features.map((f, i) => (
            <div key={i} style={{
              background: 'var(--bg3)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: 16,
              display: 'flex',
              gap: 14,
              alignItems: 'flex-start',
            }}>
              <div style={{
                background: '#6366f120',
                border: '1px solid #6366f133',
                borderRadius: 10,
                padding: 10,
                color: 'var(--purple2)',
                flexShrink: 0,
              }}>
                {f.icon}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div style={{
        padding: '32px 24px',
        background: 'var(--bg3)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div className="section-title" style={{ textAlign: 'center' }}>Why ShootDesk</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, fontFamily: 'Syne, sans-serif', textAlign: 'center', marginBottom: 20 }}>
          Kya milega tumhe?
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {benefits.map((b, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{
                background: '#10b98120',
                border: '1px solid #10b98133',
                borderRadius: '50%',
                width: 24,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <MdCheck size={14} color="#10b981" />
              </div>
              <span style={{ fontSize: 14, color: 'var(--text2)' }}>{b}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '48px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, fontFamily: 'Syne, sans-serif', marginBottom: 12 }}>
          Aaj se shuru karo
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 24 }}>
          Free mein signup karo. Koi credit card nahi chahiye.
        </p>
        <Link to="/signup">
          <button style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            border: 'none',
            borderRadius: 14,
            padding: '14px 40px',
            color: '#fff',
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 8px 32px #6366f144',
          }}>
            Free Signup →
          </button>
        </Link>
      </div>

      {/* Footer */}
      <div style={{
        borderTop: '1px solid var(--border)',
        padding: '16px 24px',
        textAlign: 'center',
        fontSize: 12,
        color: 'var(--text3)',
      }}>
        © 2025 ShootDesk • Made with ❤️ for Indian Studios
      </div>
    </div>
  )
}