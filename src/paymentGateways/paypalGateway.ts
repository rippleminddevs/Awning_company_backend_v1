import axios from 'axios'
import { PaymentGateway } from './index'
import { config } from '../services/configService'
import { AppError } from '../common/utils/appError'

export class PayPalGateway implements PaymentGateway {
  private accessToken: string | null = null

  constructor() {
    this.authenticate()
  }

  private authenticate = async (): Promise<void> => {
    try {
      const response = await axios.post(
        `${config.payment.paypal.baseUrl}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          auth: {
            username: config.payment.paypal.clientId,
            password: config.payment.paypal.secret,
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      )

      this.accessToken = response.data.access_token
    } catch (error: any) {
      console.error('Error authenticating with PayPal:', error)
      throw new AppError('Failed to authenticate with PayPal', 500)
    }
  }

  public createPaymentIntent = async (
    amount: number,
    currency: string = 'USD'
  ): Promise<string> => {
    try {
      const response = await axios.post(
        `${config.payment.paypal.baseUrl}/v2/checkout/orders`,
        {
          intent: 'CAPTURE',
          purchase_units: [
            {
              amount: {
                currency_code: currency,
                value: amount.toString(),
              },
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      )

      return response.data.id // Return the PayPal order ID
    } catch (error: any) {
      console.error('Error creating PayPal order:', error)
      throw new AppError('Failed to create PayPal order', 500)
    }
  }

  public attachPaymentCard = async (stripeCustomerId: string, paymentMethodId: string): Promise<any> => {
    // PayPal does not have a direct customer creation API
    // You can store customer information in your database
    throw new AppError('PayPal does not support customer creation', 501)
  }

  public detachCard = async (paymentMethodId: string): Promise<any> => {
    // PayPal does not have a direct customer creation API
    // You can store customer information in your database
    throw new AppError('PayPal does not support customer creation', 501)
  }

  public getUserCards = async (stripeCustomerId: string): Promise<any> => {
    // PayPal does not have a direct customer creation API
    // You can store customer information in your database
    throw new AppError('PayPal does not support customer creation', 501)
  }

  public createCustomer = async (email: string, name?: string): Promise<string> => {
    // PayPal does not have a direct customer creation API
    // You can store customer information in your database
    throw new AppError('PayPal does not support customer creation', 501)
  }

  public createSubscription = async (customerId: string, priceId: string, paymentMethodId?: string): Promise<any> => {
    // PayPal subscription logic can be implemented here
    throw new AppError('PayPal subscriptions are not implemented', 501)
  }

  public cancelSubscription = async (subscriptionId: string, cancelAtPeriodEnd: boolean): Promise<any> => {
    // PayPal subscription logic can be implemented here
    throw new AppError('PayPal subscriptions are not implemented', 501)
  }

  public createProductAndPrice = async (productName: string, productDescription: string, amount: number, currency: string, interval: 'day' | 'week' | 'month' | 'year'): Promise<{ productId: string; priceId: string }> => {
    // PayPal subscription logic can be implemented here
    throw new AppError('PayPal product creation are not implemented', 501)
  }

  public updateProductAndPrice = async (
    productId: string,
    priceId: string,
    productName: string,
    productDescription: string,
    amount: number,
    currency: string = 'usd',
    interval: 'day' | 'week' | 'month' | 'year' = 'month'
  ): Promise<{ productId: string; priceId: string }> => {
    // PayPal subscription logic can be implemented here
    throw new AppError('PayPal product update are not implemented', 501)
  }

  public handleWebhookEvent = async (payload: string, signature: string): Promise<void> => {
    // PayPal webhook handling logic can be implemented here
    throw new AppError('PayPal webhook handling is not implemented', 501)
  }
}
