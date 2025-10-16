import Stripe from 'stripe'
import { PaymentGateway } from './index'
import { AppError } from '../common/utils/appError'
import { config } from '../services/configService'
import { UserService } from '../modules/user/userService'

export class StripeGateway implements PaymentGateway {
  private stripe: Stripe

  constructor() {
    this.stripe = new Stripe(config.payment.stripe.secretKey)
  }

  public createPaymentIntent = async (
    amount: number,
    currency: string = 'usd',
    customerId: string,
    paymentMethodId: string
  ): Promise<string> => {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency,
        customer: customerId,
        payment_method: paymentMethodId,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never',
        },
        confirm: true,
      })

      if (!paymentIntent.client_secret) {
        throw new AppError('Failed to create payment intent: client_secret is null', 500)
      }

      return paymentIntent.client_secret
    } catch (error: any) {
      throw new AppError(error.message, error.statusCode)
    }
  }

  public createCustomer = async (email: string, name?: string): Promise<string> => {
    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
      })

      return customer.id
    } catch (error: any) {
      console.error('Error creating customer:', error)
      throw new AppError('Failed to create customer', 500)
    }
  }

  public attachPaymentCard = async (stripeCustomerId: string, paymentMethodId: string): Promise<any> => {
    try {
      const attachedPaymentMethod = await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: stripeCustomerId
      });

      return attachedPaymentMethod;
    } catch (error: any) {
      throw new AppError(`${error.message}`, 500);
    }
  };

  public detachCard = async (paymentMethodId: string): Promise<any> => {
    try {
      const response = await this.stripe.paymentMethods.detach(paymentMethodId);
      return response;
    } catch (error: any) {
      throw new AppError('Failed to detach payment card', 500)
    }
  }

  public getUserCards = async (stripeCustomerId: string): Promise<any[]> => {
    try {
      const paymentMethods = await this.stripe.paymentMethods.list({
        customer: stripeCustomerId,
        type: 'card',
      });

      return paymentMethods.data;
    } catch (error: any) {
      throw new AppError(`Failed to fetch user cards: ${error.message}`, 500);
    }
  };

  public createSubscription = async (customerId: string, priceId: string, paymentMethodId?: string): Promise<any> => {
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        default_payment_method: paymentMethodId,
        expand: ['latest_invoice.payment_intent'],
      })

      return subscription
    } catch (error: any) {
      console.error('Error creating subscription:', error)
      throw new AppError('Failed to create subscription', 500)
    }
  }

  public cancelSubscription = async (
    subscriptionId: string,
    cancelImmediately: boolean = false
  ): Promise<any> => {
    try {
      let subscription

      if (cancelImmediately) {
        // Immediate cancellation
        subscription = await this.stripe.subscriptions.cancel(subscriptionId)
      } else {
        // Cancel at period end
        subscription = await this.stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        })
      }

      return subscription
    } catch (error: any) {
      console.error('Error cancelling subscription:', error)
      throw new AppError('Failed to cancel subscription', 500, error.message)
    }
  }

  public createProductAndPrice = async (
    productName: string,
    productDescription: string,
    amount: number,
    currency: string = 'usd',
    interval: 'day' | 'week' | 'month' | 'year' = 'month'
  ): Promise<{ productId: string; priceId: string }> => {
    try {
      // 1. Create the product
      const product = await this.stripe.products.create({
        name: productName,
        description: productDescription,
      });

      // 2. Create the price for that product
      const price = await this.stripe.prices.create({
        unit_amount: amount,
        currency,
        recurring: { interval },
        product: product.id,
      });

      return { productId: product.id, priceId: price.id };
    } catch (error: any) {
      throw new AppError('Failed to create product and price', 500, error.message);
    }
  };

  public updateProductAndPrice = async (
    productId: string,
    priceId: string,
    productName: string,
    productDescription: string,
    amount: number,
    currency: string = 'usd',
    interval: 'day' | 'week' | 'month' | 'year' = 'month'
  ): Promise<{ productId: string; priceId: string }> => {
    try {
      // 1. Update the product
      await this.stripe.products.update(productId, {
        name: productName,
        description: productDescription,
      });

      // 2. Create a new price 
      const newPrice = await this.stripe.prices.create({
        unit_amount: amount,
        currency,
        recurring: { interval },
        product: productId,
      });

      return { productId, priceId: newPrice.id };
    } catch (error: any) {
      throw new AppError('Failed to update product and price', 500, error.message);
    }
  };

  public handleWebhookEvent = async (payload: string, signature: string): Promise<void> => {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        config.payment.stripe.webhookSecret
      );

      switch (event.type) {
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
        case 'invoice.payment_failed':
          // We'll handle these events in a separate method
          await this.handleSubscriptionEvent(event);
          break;

        case 'invoice.payment_succeeded':
          // Handle successful payment
          await this.handleSuccessfulPayment(event.data.object);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error: any) {
      console.error('Error handling webhook event:', error);
      throw new AppError('Failed to handle webhook event', 500, error.message);
    }
  };

  private handleSubscriptionEvent = async (event: any): Promise<void> => {
    // const subscription = event.data.object;
    // const subscriptionId = subscription.id;

    // // Get the subscription from our database
    // const subscriptionService = new SubscriptionService();
    // const sub = await subscriptionService.getBySubscriptionId(subscriptionId);

    // if (!sub) {
    //   console.log(`Subscription ${subscriptionId} not found in our database`);
    //   return;
    // }

    // // Handle different subscription statuses
    // switch (subscription.status) {
    //   case 'active':
    //     // Subscription is active
    //     await subscriptionService.update(subscriptionId, {
    //       status: 'active',
    //       currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    //       cancelAtPeriodEnd: subscription.cancel_at_period_end
    //     });
    //     break;

    //   case 'past_due':
    //     // Payment failed but still in grace period
    //     await subscriptionService.update(subscriptionId, {
    //       status: 'past_due'
    //     });
    //     break;

    //   case 'canceled':
    //     // Subscription was canceled
    //     await subscriptionService.cancelSubscription(subscriptionId, {
    //       cancelImmediately: true,
    //       status: 'canceled'
    //     });
    //     break;

    //   case 'unpaid':
    //     // Subscription is unpaid (after grace period)
    //     await subscriptionService.cancelSubscription(subscriptionId, {
    //       cancelImmediately: true,
    //       status: 'canceled'
    //     });
    //     break;
    // }
  };

  private handleSuccessfulPayment = async (invoice: any): Promise<void> => {
    // const subscriptionId = invoice.subscription;
    // if (!subscriptionId) return;

    // const subscriptionService = new SubscriptionService();
    // const sub = await subscriptionService.getBySubscriptionId(subscriptionId);

    // if (sub) {
    //   // Update subscription with new period
    //   await subscriptionService.update(subscriptionId, {
    //     status: 'active',
    //     currentPeriodStart: new Date(invoice.period_start * 1000),
    //     currentPeriodEnd: new Date(invoice.period_end * 1000)
    //   });

    //   // Update user's premium status
    //   const userService = new UserService();
    //   await userService.update(sub.user, { isPremium: true });
    // }
  };
}
