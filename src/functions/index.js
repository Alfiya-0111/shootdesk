// Firebase Functions - Server side notification scheduling
const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp()

// Scheduled function - runs every hour
exports.sendScheduledReminders = functions.pubsub
  .schedule('every 60 minutes')
  .onRun(async (context) => {
    const now = Date.now()
    const oneHourLater = now + 3600000 // 1 hour window
    
    const remindersRef = admin.firestore().collectionGroup('scheduledReminders')
    const snapshot = await remindersRef
      .where('reminders', 'array-contains-any', [
        { scheduled: true, time: admin.firestore.Timestamp.fromMillis(now) }
      ])
      .get()
    
    const messages = []
    
    snapshot.forEach(doc => {
      const data = doc.data()
      const dueReminders = data.reminders.filter(r => 
        r.scheduled && r.time.toMillis() >= now && r.time.toMillis() <= oneHourLater
      )
      
      dueReminders.forEach(reminder => {
        messages.push({
          notification: {
            title: reminder.title,
            body: reminder.body,
          },
          data: {
            orderId: data.orderId,
            type: 'shoot_reminder',
            url: '/app/orders'
          },
          topic: `studio_${doc.ref.parent.parent.id}` // Send to studio topic
        })
      })
    })
    
    // Send all messages
    if (messages.length > 0) {
      await admin.messaging().sendAll(messages)
    }
    
    return null
  })

// HTTP function for immediate test notification
exports.sendTestNotification = functions.https.onCall(async (data, context) => {
  const { token, title, body } = data
  
  const message = {
    notification: { title, body },
    token,
  }
  
  try {
    await admin.messaging().send(message)
    return { success: true }
  } catch (e) {
    return { success: false, error: e.message }
  }
})