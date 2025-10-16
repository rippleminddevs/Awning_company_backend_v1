import * as admin from 'firebase-admin'
import { UserModel } from '../modules/user/userModel'
import { FirebaseMulticastMessage } from '../common/interfaces/globalInterfaces'
import { User } from '../modules/user/userInterface'

const userModel = UserModel.getInstance()
const serviceAccount = require('../../serviceAccountKey.json') // Download from Firebase Console
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})
const messaging = admin.messaging()

class PushNotificationService {
  public sendToUsers = async (userIds: string[], title: string, body: string, data?: Record<string, any>) => {
    try {
      const users: User[] = (await userModel.getAll({ _id: { $in: userIds } })) as User[]
      const tokens = users.flatMap(user => user.deviceTokens ?? []).filter(Boolean)
      if (tokens.length === 0) {
        throw new Error('No device tokens available')
      }

      const message: FirebaseMulticastMessage = {
        notification: {
          title,
          body,
        },
        data,
        tokens,
      }

      const response = await messaging.sendEachForMulticast(message)
      console.log('Notification sent successfully:', response)
      return response
    } catch (error) {
      console.error('Error sending notification:', error)
    }
  }
}

export default new PushNotificationService()
