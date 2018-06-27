import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { IPushNotification } from './push-notification'
import { CallableContext } from 'firebase-functions/lib/providers/https'

admin.initializeApp()

interface IServerResponse {
  message: string
}

export const sendPushNotification = functions.https.onCall((data, context) => {
  return sendPushNotificationHandler(data, context, true)
})

export const sendPushNotificationDev = functions.https.onCall((data, context) => {
  return sendPushNotificationHandler(data, context, false)
})

function sendPushNotificationHandler(
  data: IPushNotification,
  context: CallableContext,
  isProd: boolean
): Promise<IServerResponse> {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'The function must be called while authenticated.'
    )
  }

  return new Promise<IServerResponse>((resolve, reject) => {
    console.log(data)
    const targetApps = data.target.map(m => m.mobileApp.language)
    console.log(targetApps.join(', '))
    let message = ''

    targetApps.forEach(topic => {
      console.log(topic)
      console.log(data.title)
      sendNotification(
        topic,
        data.title,
        data.message,
        data.articleId ? data.articleId.toString() : ''
      )
        .then(response => {
          message += `Success: ${topic}`
          if (!isProd) {
            message += `(dry run)`
          }
          console.log(message)
        })
        .catch(error => {
          message += `Failed: ${topic}`
          if (!isProd) {
            message += `(dry run)`
          }
          console.log(message)
          console.error(error)
        })
    })

    resolve({ message: message })
  })
}

function sendNotification(
  topic: string,
  title: string,
  message: string,
  articleId: string
): Promise<admin.messaging.MessagingTopicResponse> {
  const payload: admin.messaging.MessagingPayload = {
    data: {
      articleId: articleId,
    },
    notification: {
      title: title,
      body: message,
      sound: 'default',
      badge: '1',
    },
  }

  const options: admin.messaging.MessagingOptions = {
    priority: 'high',
    contentAvailable: true,
  }

  console.log(`/topics/${topic}`)

  return admin.messaging().sendToTopic(`/topics/${topic}`, payload, options)
}
