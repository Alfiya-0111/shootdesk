// src/services/WhatsAppService.js

const TWILIO_SID = import.meta.env.VITE_TWILIO_ACCOUNT_SID
const TWILIO_TOKEN = import.meta.env.VITE_TWILIO_AUTH_TOKEN
const TWILIO_WHATSAPP = import.meta.env.VITE_TWILIO_WHATSAPP_NUMBER

export async function sendWhatsAppReminder(phone, message) {
  const toNumber = phone.startsWith('+') ? phone : `+91${phone}`
  
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`
  
  const body = new URLSearchParams({
    From: `whatsapp:${TWILIO_WHATSAPP}`,
    To: `whatsapp:${toNumber}`,
    Body: message,
  })
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${TWILIO_SID}:${TWILIO_TOKEN}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body,
    })
    
    const data = await response.json()
    console.log('WhatsApp sent:', data)
    return data
  } catch (e) {
    console.error('WhatsApp error:', e)
    return null
  }
}

export function getReminderTemplate(type, order) {
  const templates = {
    oneDay: `📸 *ShootDesk Reminder*

Hello ${order.clientName}!

Kal aapka *${order.shootType}* shoot hai.

📅 Date: ${order.date}
⏰ Time: ${order.time || 'TBA'}
📍 Venue: ${order.venue || 'TBA'}

Team ready hai! See you tomorrow 😊

— ${order.studioName || 'ShootDesk'}`,

    twoHours: `⏰ *ShootDesk Alert*

${order.clientName} ji!

Aapka *${order.shootType}* shoot sirf *2 ghante* mein hai!

📍 Venue: ${order.venue || 'TBA'}
⏰ Time: ${order.time || 'TBA'}

Team nikal rahi hai. Milte hain! 🚀

— ${order.studioName || 'ShootDesk'}`,

    thirtyMin: `🚀 *ShootDesk - Time to Go!*

${order.clientName} ji!

Bas *30 minute* baki hain!

📍 Venue: ${order.venue || 'TBA'}
⏰ Time: ${order.time || 'TBA'}

See you there! 📸

— ${order.studioName || 'ShootDesk'}`,

    balanceDue: `💰 *Payment Reminder*

Hello ${order.clientName},

Aapka *${order.shootType}* shoot complete ho gaya hai.

Balance Due: *₹${(Number(order.total || 0) - Number(order.advance || 0)).toLocaleString()}*

Payment karne ke liye contact karein:
📞 ${order.studioPhone || ''}

Thank you! 🙏

— ${order.studioName || 'ShootDesk'}`,
  }
  
  return templates[type] || templates.oneDay
}

export async function scheduleWhatsAppReminders(order, studioData) {
  const reminders = []
  
  const oneDayBefore = new Date(order.date)
  oneDayBefore.setDate(oneDayBefore.getDate() - 1)
  oneDayBefore.setHours(21, 0, 0, 0)
  
  const [hours, minutes] = (order.time || '10:00').split(':').map(Number)
  const twoHoursBefore = new Date(order.date)
  twoHoursBefore.setHours(hours - 2, minutes, 0, 0)
  
  const thirtyMinBefore = new Date(order.date)
  thirtyMinBefore.setHours(hours, minutes - 30, 0, 0)
  
  const now = Date.now()
  
  if (oneDayBefore.getTime() > now && order.phone) {
    setTimeout(() => {
      sendWhatsAppReminder(order.phone, getReminderTemplate('oneDay', {
        ...order,
        studioName: studioData?.studioName,
        studioPhone: studioData?.phone
      }))
    }, oneDayBefore.getTime() - now)
    reminders.push({ type: 'oneDay', time: oneDayBefore })
  }
  
  if (twoHoursBefore.getTime() > now && order.phone) {
    setTimeout(() => {
      sendWhatsAppReminder(order.phone, getReminderTemplate('twoHours', {
        ...order,
        studioName: studioData?.studioName,
        studioPhone: studioData?.phone
      }))
    }, twoHoursBefore.getTime() - now)
    reminders.push({ type: 'twoHours', time: twoHoursBefore })
  }
  
  if (thirtyMinBefore.getTime() > now && order.phone) {
    setTimeout(() => {
      sendWhatsAppReminder(order.phone, getReminderTemplate('thirtyMin', {
        ...order,
        studioName: studioData?.studioName,
        studioPhone: studioData?.phone
      }))
    }, thirtyMinBefore.getTime() - now)
    reminders.push({ type: 'thirtyMin', time: thirtyMinBefore })
  }
  
  return reminders
}