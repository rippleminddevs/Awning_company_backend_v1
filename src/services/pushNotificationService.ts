import * as admin from 'firebase-admin'
import { UserModel } from '../modules/user/userModel'
import { FirebaseMulticastMessage } from '../common/interfaces/globalInterfaces'
import { User } from '../modules/user/userInterface'
import { readFileSync } from 'fs'
import CryptoJS from 'crypto-js';
import path from 'path'
import dotenv from 'dotenv';
dotenv.config();
// import { config } from './configService'

const decryptServiceAccount = () => {
  const env = process.env.NODE_ENV || 'production';
  if (env !== 'development') {
    const secretKey = process.env.SECRET_KEY!;
    console.log('secretKey', secretKey);
    const encryptedEnvPath = path.join(__dirname, `../../serviceAccountKey.enc.json`);
    const encryptedData = JSON.parse(readFileSync(encryptedEnvPath, 'utf-8')).data;
    const decryptedData = CryptoJS.AES.decrypt(encryptedData, secretKey).toString(CryptoJS.enc.Utf8);
    const decryptedServiceAccount: any = JSON.parse(decryptedData);
    return decryptedServiceAccount;
  }
  const serviceAccount = require('../../serviceAccountKey.json') // Download from Firebase Console
  return serviceAccount;
}

const userModel = UserModel.getInstance()
const decryptedServiceAccount: any = decryptServiceAccount();
console.log('decryptedServiceAccount', decryptedServiceAccount);
const serviceAccount = decryptedServiceAccount;
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})
const messaging = admin.messaging()

class PushNotificationService {
  public sendToUsers = async (
    userIds: string[],
    title: string,
    body: string,
    data?: Record<string, any>
  ) => {
    try {
      console.log('🔔 [PUSH] Starting push notification process...')
      console.log('🔔 [PUSH] User IDs:', userIds)
      console.log('🔔 [PUSH] Title:', title)
      console.log('🔔 [PUSH] Body:', body)
      console.log('🔔 [PUSH] Data (raw):', data)

      const users: User[] = (await userModel.getAll({ _id: { $in: userIds } })) as User[]
      console.log('🔔 [PUSH] Users found:', users.length)

      const tokens = users.flatMap(user => user.deviceTokens ?? []).filter(Boolean)
      console.log('🔔 [PUSH] Total tokens found:', tokens.length)
      console.log('🔔 [PUSH] Tokens:', tokens)

      if (tokens.length === 0) {
        console.log('🔔 [PUSH] No device tokens available for users:', userIds)
        throw new Error('No device tokens available')
      }

      // Convert all data values to strings for Firebase
      const stringData: Record<string, string> = {}
      if (data) {
        for (const [key, value] of Object.entries(data)) {
          stringData[key] = String(value)
        }
      }

      console.log('🔔 [PUSH] Data (converted to strings):', stringData)

      const message: FirebaseMulticastMessage = {
        notification: {
          title,
          body,
        },
        data: stringData,
        tokens,
      }

      console.log('🔔 [PUSH] Sending to', tokens.length, 'tokens...')
      const response = await messaging.sendEachForMulticast(message)

      console.log('🔔 [PUSH] === RESPONSE START ===')
      console.log('🔔 [PUSH] Success count:', response.successCount)
      console.log('🔔 [PUSH] Failure count:', response.failureCount)
      console.log('🔔 [PUSH] Total responses:', response.responses.length)

      response.responses.forEach((resp, idx) => {
        if (resp.success) {
          console.log(`🔔 [PUSH] Token #${idx + 1} SUCCESS:`, resp.success)
        } else {
          console.log(`🔔 [PUSH] Token #${idx + 1} FAILED:`, resp.error)
          console.log(`🔔 [PUSH] Token #${idx + 1} was:`, tokens[idx])
        }
      })

      console.log('🔔 [PUSH] === RESPONSE END ===')

      return response
    } catch (error) {
      console.error('🔔 [PUSH] ERROR sending notification:', error)
      throw error
    }
  }
}

export default new PushNotificationService()
