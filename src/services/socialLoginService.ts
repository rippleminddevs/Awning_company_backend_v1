import { OAuth2Client } from 'google-auth-library'
import { config } from './configService'

class SocialLoginService {
  public verifyGoogleToken = async (idToken: string) => {
    try {
      const client = new OAuth2Client(config.socialLogin.google.clientID)
      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      })
      const payload = ticket.getPayload()
      return payload
    } catch (error) {
      console.error('Error verifying Google ID token:', error)
      return null
    }
  }

  public verifyFacebookToken = async (accessToken: string) => {
    try {
      const response = await fetch(
        `https://graph.facebook.com/debug_token?input_token=${accessToken}&access_token=${config.socialLogin.facebook.clientID}|${config.socialLogin.facebook.clientSecret}`
      )
      const data = await response.json()
      if (data.data.is_valid) {
        const userInfo = await fetch(
          `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`
        )
        return userInfo.json()
      }
      return null
    } catch (error) {
      console.error('Error verifying Facebook token:', error)
      return null
    }
  }
}

export default new SocialLoginService()
