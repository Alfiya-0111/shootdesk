// src/services/payment.js

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID

export async function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export async function createOrder(planId, amount) {
  // Backend function call (Firebase Function ya temp workaround)
  // Abhi ke liye frontend se direct order bana rahe hain
  // Production mein backend se banayein
  
  return {
    id: `order_${Date.now()}`,
    amount: amount * 100,
    currency: 'INR',
  }
}

export function openRazorpay(options, onSuccess, onError) {
  const rzp = new window.Razorpay({
    key: RAZORPAY_KEY,
    amount: options.amount,
    currency: 'INR',
    name: 'ShootDesk',
    description: options.description,
    image: '/icon-192x192.png',
    order_id: options.orderId,
    handler: function (response) {
      onSuccess(response)
    },
    prefill: {
      name: options.userName,
      email: options.userEmail,
      contact: options.userPhone,
    },
    theme: {
      color: '#6366f1',
    },
    modal: {
      ondismiss: function() {
        onError('Payment cancelled')
      }
    }
  })
  
  rzp.open()
}