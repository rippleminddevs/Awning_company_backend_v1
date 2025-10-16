export interface PaymentGateway {
  createPaymentIntent(amount: number, currency: string, customerId: string, paymentMethodId: string): Promise<string>
  createCustomer(email: string, name?: string): Promise<string>
  attachPaymentCard(stripeCustomerId: string, paymentMethodId: string): Promise<any>
  detachCard(paymentMethodId: string): Promise<any>
  getUserCards(stripeCustomerId: string): Promise<any>
  createSubscription(customerId: string, priceId: string, paymentMethodId?: string): Promise<any>
  cancelSubscription(subscriptionId: string, cancelAtPeriodEnd: boolean): Promise<any>
  createProductAndPrice(productName: string, productDescription: string, amount: number, currency: string, interval: 'day' | 'week' | 'month' | 'year'): Promise<{ productId: string; priceId: string }>;
  updateProductAndPrice(productId: string, priceId: string, productName: string, productDescription: string, amount: number, currency: string, interval: 'day' | 'week' | 'month' | 'year'): Promise<{ productId: string; priceId: string }>;
  handleWebhookEvent(payload: string, signature: string): Promise<void>
}
