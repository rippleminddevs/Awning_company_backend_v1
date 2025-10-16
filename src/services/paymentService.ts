import { StripeGateway } from '../paymentGateways/stripeGateway'
import { PayPalGateway } from '../paymentGateways/paypalGateway'
import { PaymentGateway } from '../paymentGateways'

export class PaymentService {
  private gateway: PaymentGateway

  constructor(gateway: 'stripe' | 'paypal') {
    switch (gateway) {
      case 'stripe':
        this.gateway = new StripeGateway()
        break
      case 'paypal':
        this.gateway = new PayPalGateway()
        break
      default:
        throw new Error('Unsupported payment gateway')
    }
  }

  public createPaymentIntent = async (amount: number, currency: string, customerId: string, paymentMethodId: string): Promise<string> => {
    return this.gateway.createPaymentIntent(amount, currency, customerId, paymentMethodId)
  }

  public createCustomer = async (email: string, name?: string): Promise<string> => {
    return this.gateway.createCustomer(email, name)
  }

  public attachPaymentCard = async (stripeCustomerId: string, paymentMethodId: string): Promise<any> => {
    return this.gateway.attachPaymentCard(stripeCustomerId, paymentMethodId)
  }

  public detachCard = async (paymentMethodId: string): Promise<any> => {
    return this.gateway.detachCard(paymentMethodId)
  }

  public getUserCards = async (stripeCustomerId: string): Promise<any> => {
    return this.gateway.getUserCards(stripeCustomerId)
  }

  public createSubscription = async (customerId: string, priceId: string, paymentMethodId?: string): Promise<any> => {
    return this.gateway.createSubscription(customerId, priceId, paymentMethodId)
  }

  public cancelSubscription = async (subscriptionId: string, cancelAtPeriodEnd: boolean): Promise<any> => {
    return this.gateway.cancelSubscription(subscriptionId, cancelAtPeriodEnd)
  }

  public createProductAndPrice = async (
    productName: string,
    productDescription: string,
    amount: number,
    currency: string = 'usd',
    interval: 'day' | 'week' | 'month' | 'year' = 'month'
  ): Promise<{ productId: string; priceId: string }> => {
    return this.gateway.createProductAndPrice(productName, productDescription, amount, currency, interval)
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
    return this.gateway.updateProductAndPrice(productId, priceId, productName, productDescription, amount, currency, interval)
  }

  public handleWebhookEvent = async (payload: string, signature: string): Promise<void> => {
    return this.gateway.handleWebhookEvent(payload, signature)
  }
}
