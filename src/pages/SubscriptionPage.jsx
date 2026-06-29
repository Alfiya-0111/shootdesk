import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { loadRazorpay, openRazorpay, createOrder } from '../services/payment'
import { MdCheck, MdCardGiftcard, MdArrowForward } from 'react-icons/md'

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    displayPrice: '₹0',
    period: 'forever',
    features: [
      '50 orders max',
      'Basic calendar',
      'Client management',
      'Team up to 3 members',
    ],
    color: '#64748b',
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 99,
    displayPrice: '₹99',
    period: '/month',
    features: [
      'Unlimited orders',
      'WhatsApp reminders',
      'PDF invoice generate',
      'Advanced analytics',
      'Priority support',
    ],
    color: '#6366f1',
    popular: true,
  },
  {
    id: 'studio',
    name: 'Studio',
    price: 299,
    displayPrice: '₹299',
    period: '/month',
    features: [
      'Everything in Pro',
      'Multi-user (5 staff)',
      'Custom branding',
      'API access',
      'Dedicated manager',
    ],
    color: '#f59e0b',
    popular: false,
  },
]

export default function SubscriptionPage() {
  const { studioData, upgradePlan } = useAuth()
  const navigate = useNavigate()
  const [selected, setSelected] = useState('pro')
  const [loading, setLoading] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState('')

  const isTrial = studioData?.plan === 'trial'
  const trialDaysLeft = isTrial 
    ? Math.ceil((studioData?.trialEnd - Date.now()) / 86400000) 
    : 0

  async function handleSubscribe() {
    if (selected === 'free') {
      navigate('/app/dashboard')
      return
    }

    const plan = PLANS.find(p => p.id === selected)
    if (!plan) return

    setLoading(true)
    setPaymentStatus('Loading payment...')

    try {
      // Load Razorpay
      const loaded = await loadRazorpay()
      if (!loaded) {
        alert('Payment system load nahi hua. Refresh karo.')
        setLoading(false)
        return
      }

      // Create order
      const order = await createOrder(selected, plan.price)

      // Open Razorpay
      openRazorpay(
        {
          orderId: order.id,
          amount: order.amount,
          description: `${plan.name} Plan - ShootDesk`,
          userName: studioData?.ownerName || '',
          userEmail: studioData?.email || '',
          userPhone: studioData?.phone || '',
        },
        async (response) => {
          // Payment success
          console.log('Payment success:', response)
          setPaymentStatus('Payment successful! Activating...')
          
          // Save payment to Firestore (optional)
          // await savePaymentDetails(response)
          
          // Upgrade plan
          await upgradePlan(selected)
          setPaymentStatus('Plan activated!')
          setTimeout(() => navigate('/app/dashboard'), 1500)
        },
        (error) => {
          console.log('Payment error:', error)
          setPaymentStatus('Payment failed. Try again.')
          setLoading(false)
        }
      )
    } catch (e) {
      console.error(e)
      setPaymentStatus('Something went wrong.')
      setLoading(false)
    }
  }

  return (
    <div className="page" style={{ paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{
          fontSize: 13,
          color: 'var(--purple2)',
          fontWeight: 600,
          marginBottom: 8,
        }}>
          {isTrial ? `⏰ Trial ends in ${trialDaysLeft} days` : 'Choose Your Plan'}
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 800, fontFamily: 'Syne, sans-serif' }}>
          Apna Plan Chuno
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>
          {isTrial ? 'Trial khatam hone se pehle upgrade karo' : 'Best value for your studio'}
        </p>
      </div>

      {/* Payment Status */}
      {paymentStatus && (
        <div style={{
          background: paymentStatus.includes('success') ? '#10b98120' : '#f59e0b20',
          border: `1px solid ${paymentStatus.includes('success') ? '#10b981' : '#f59e0b'}33`,
          borderRadius: 10,
          padding: 12,
          marginBottom: 16,
          textAlign: 'center',
          color: paymentStatus.includes('success') ? '#10b981' : '#f59e0b',
          fontSize: 13,
          fontWeight: 600,
        }}>
          {paymentStatus}
        </div>
      )}

      {/* Plans */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {PLANS.map(plan => (
          <div
            key={plan.id}
            onClick={() => setSelected(plan.id)}
            style={{
              background: selected === plan.id ? `${plan.color}10` : 'var(--bg3)',
              border: `2px solid ${selected === plan.id ? plan.color : 'var(--border)'}`,
              borderRadius: 16,
              padding: 20,
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.2s',
              opacity: studioData?.plan === plan.id ? 0.7 : 1,
            }}
          >
            {plan.popular && (
              <div style={{
                position: 'absolute',
                top: -10,
                right: 16,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff',
                fontSize: 10,
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: 20,
              }}>
                POPULAR
              </div>
            )}

            {studioData?.plan === plan.id && (
              <div style={{
                position: 'absolute',
                top: 10,
                left: 16,
                background: '#10b981',
                color: '#fff',
                fontSize: 10,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 20,
              }}>
                CURRENT
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: plan.color }}>
                  {plan.name}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                  {plan.id === 'free' ? 'Forever free' : 'Billed monthly'}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)' }}>
                  {plan.displayPrice}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                  {plan.period}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {plan.features.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MdCheck size={16} color={plan.color} />
                  <span style={{ fontSize: 13, color: 'var(--text2)' }}>{f}</span>
                </div>
              ))}
            </div>

            {selected === plan.id && (
              <div style={{
                marginTop: 12,
                textAlign: 'center',
                color: plan.color,
                fontSize: 12,
                fontWeight: 700,
              }}>
                ✓ Selected
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Subscribe Button */}
      <button
        onClick={handleSubscribe}
        disabled={loading || selected === studioData?.plan}
        style={{
          position: 'fixed',
          bottom: 80,
          left: 20,
          right: 20,
          background: selected === 'free' || selected === studioData?.plan ? 'var(--bg3)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          border: 'none',
          borderRadius: 14,
          padding: '16px 0',
          color: selected === 'free' || selected === studioData?.plan ? 'var(--text3)' : '#fff',
          fontSize: 16,
          fontWeight: 700,
          cursor: selected === 'free' || selected === studioData?.plan ? 'not-allowed' : 'pointer',
          boxShadow: selected === 'free' || selected === studioData?.plan ? 'none' : '0 8px 32px #6366f144',
          zIndex: 99,
        }}
      >
        {loading ? 'Processing...' : selected === studioData?.plan ? 'Current Plan' : selected === 'free' ? 'Free Plan Active' : 'Subscribe Now →'}
      </button>

      {/* Referral Section */}
      <div style={{
        background: 'var(--bg3)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: 16,
        marginTop: 20,
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--purple2)', marginBottom: 8 }}>
          <MdCardGiftcard size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          Refer & Earn
        </div>
        <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 10 }}>
          Dost ko invite karo, 1 month free pao
        </div>
        <div style={{
          background: 'var(--bg2)',
          borderRadius: 10,
          padding: '10px 16px',
          fontSize: 14,
          fontWeight: 700,
          color: 'var(--text)',
          fontFamily: 'monospace',
        }}>
          {studioData?.referralCode || 'Loading...'}
        </div>
      </div>
    </div>
  )
}