import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { MdContentCopy, MdShare, MdCardGiftcard } from 'react-icons/md'

export default function ReferralPage() {
  const { studioData } = useAuth()
  const [copied, setCopied] = useState(false)

  const referralLink = `https://shootdesk.app/signup?ref=${studioData?.referralCode}`

  function copyLink() {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function shareWhatsApp() {
    const text = `📸 ShootDesk - Photography Studio Management App
    
Mere referral se join karo aur 50% off pao!
    
Link: ${referralLink}`
    
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <div className="page">
      <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>Refer & Earn</h2>
      <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 24 }}>
        Dost ko invite karo, 1 month free pao
      </p>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 10,
        marginBottom: 20,
      }}>
        <div style={{
          background: 'var(--bg3)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          padding: 16,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#6366f1' }}>
            {studioData?.referralsCount || 0}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>Referrals</div>
        </div>
        <div style={{
          background: 'var(--bg3)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          padding: 16,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981' }}>
            {studioData?.freeMonthsEarned || 0}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>Free Months</div>
        </div>
      </div>

      {/* Referral Code */}
      <div style={{
        background: 'var(--bg3)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: 20,
        marginBottom: 16,
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--purple2)', marginBottom: 12 }}>
          <MdCardGiftcard size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          Tera Referral Code
        </div>

        <div style={{
          display: 'flex',
          gap: 10,
          marginBottom: 16,
        }}>
          <div style={{
            flex: 1,
            background: 'var(--bg2)',
            borderRadius: 10,
            padding: '12px 16px',
            fontSize: 18,
            fontWeight: 800,
            fontFamily: 'monospace',
            color: 'var(--text)',
            textAlign: 'center',
            letterSpacing: 2,
          }}>
            {studioData?.referralCode || 'Loading...'}
          </div>
          <button
            onClick={copyLink}
            style={{
              background: copied ? '#10b981' : 'var(--purple)',
              border: 'none',
              borderRadius: 10,
              padding: '0 16px',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <MdContentCopy size={16} />
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <button
          onClick={shareWhatsApp}
          style={{
            width: '100%',
            background: '#25D366',
            border: 'none',
            borderRadius: 10,
            padding: '12px 0',
            color: '#fff',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <MdShare size={18} /> Share on WhatsApp
        </button>
      </div>

      {/* How it works */}
      <div style={{
        background: 'var(--bg3)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: 20,
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
          Kaise kaam karta hai?
        </div>
        {[
          'Apna referral code copy karo',
          'Dost ko WhatsApp pe bhejo',
          'Dost signup kare aur Pro plan le',
          'Tumhe 1 month free milega',
        ].map((step, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
            <div style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: 'var(--purple)',
              color: '#fff',
              fontSize: 12,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              {i + 1}
            </div>
            <span style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{step}</span>
          </div>
        ))}
      </div>
    </div>
  )
}