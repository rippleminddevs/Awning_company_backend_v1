import { BaseService } from '../../common/core/baseService';
import { QuoteModel } from './quoteModel';
import { OrderService } from '../order/orderService';
import { CreateOrderForQuote, CreateQuote, GetQuotesParams, PaymentDetails, PaymentStructure, PaymentSummary, Quote, QuoteResponse, SalesPersonAnalytics, SyncOrderForQuote, UploadDocuments } from './quoteInterface';
import { ProductModel } from '../product/productModel';
import { UploadService } from '../upload/uploadService'
import { Types } from 'mongoose';
import { QuotePaginatedResponse } from '../../common/interfaces/globalInterfaces';
import { AppointmentModel } from '../appointment/appointmentModel';
import { UserService } from '../user/userService'
export class QuoteService extends BaseService<Quote> {
  private orderService: OrderService;
  private productModel: ProductModel;
  private uploadService: UploadService;
  private appointmentModel: AppointmentModel;
  private userService: UserService;

  constructor() {
    super(QuoteModel.getInstance());
    this.orderService = new OrderService();
    this.uploadService = new UploadService();
    this.productModel = ProductModel.getInstance();
    this.appointmentModel = AppointmentModel.getInstance();
    this.userService = new UserService()
  }

  // private function to return populated data
  private getPopulatedData = async (id: string): Promise<QuoteResponse> => {
    const quoteModel = this.model.getMongooseModel();
    const quote = await quoteModel.findById(id)
      .populate({
        path: 'appointmentId',
        select: `customerType firstName lastName source emailAddress address1 address2
                  city zipCode status bestContact customerNotes date time`,
        populate: [
          {
            path: 'service',
            select: 'name'
          },
          {
            path: 'staff',
            select: 'name email'
          }
        ],
        model: 'Appointment'
      })
      .populate({
        path: 'documents',
        select: '_id url',
        model: 'Upload'
      })
      .populate({
        path: 'invoice',
        select: 'url',
        model: 'Upload'
      })
      .lean();
      
    if (!quote) {
      throw new Error('Quote not found');
    }

    quote.invoice = quote.invoice?.url || null;
    quote.appointmentId.service = quote.appointmentId.service?.name || null;
    
    return quote;
  }

  // private function to calculate payment summary
  private calculatePaymentSummary(
    paymentStructure: PaymentStructure,
    paymentDetails: PaymentDetails
  ): PaymentSummary {
    const subtotal = parseFloat(paymentStructure.discountedSalesPrice || '0') || 0;
    const discount = parseFloat(paymentStructure.discount || '0') || 0;
    const taxRate = paymentStructure.salesTax === 'Default' ? 0.08 : 0; // 8% default tax
    const taxes = subtotal * taxRate;
    const freight = parseFloat(paymentStructure.freight || '0') || 0;
    const total = subtotal;
  
    // Calculate payment schedule
    const upfrontPercentage = parseFloat(paymentStructure.upfrontDeposit) || 50; // Default 50%
    const upfrontAmount = (upfrontPercentage / 100) * total;
    const remainingAmount = total - upfrontAmount;
    const numberOfInstallments = parseInt(paymentStructure.numberOfInstallments || '1', 10) || 1;
    const installmentAmount = remainingAmount / Math.max(1, numberOfInstallments - 1);
  
    return {
      subtotal: subtotal.toFixed(2),
      discount: discount.toFixed(2),
      taxes: taxes.toFixed(2),
      freight: freight.toFixed(2),
      total: total.toFixed(2),
      dueAcceptance: upfrontAmount.toFixed(2),
      installments: numberOfInstallments.toString(),
      duePriorDelivery: installmentAmount.toFixed(2),
      balanceCompletion: (remainingAmount - installmentAmount).toFixed(2)
    };
  }

  // Calculates the unit price for a single order item
  private calculateUnitPrice = async (orderData: any): Promise<number> => {
    try {
      // Get the product
      const product = await this.productModel.getMongooseModel()?.findById(orderData.product);
      if (!product) {
        throw new Error('Product not found');
      }
  
      const { pricing } = product;
      let unitPrice = pricing.basePrice;
  
      // Process each dimension with its rules
      const dimensions = [
        { 
          name: 'width', 
          ft: orderData.width_ft, 
          in: orderData.width_in,
          rules: pricing.rules.filter(rule => rule.condition.startsWith('width'))
        },
        { 
          name: 'height', 
          ft: orderData.height_ft, 
          in: orderData.height_in,
          rules: pricing.rules.filter(rule => rule.condition.startsWith('height'))
        },
        { 
          name: 'projection', 
          ft: orderData.projection_ft, 
          in: orderData.projection_in,
          rules: pricing.rules.filter(rule => rule.condition.startsWith('projection'))
        }
      ];
  
      for (const dim of dimensions) {
        // Process both feet and inches rules
        for (const unit of ['ft', 'in']) {
          const value = dim[unit as keyof typeof dim];
          if (value === undefined || value === null) continue;
  
          // Find rules for this dimension and unit
          const unitRules = dim.rules.filter(rule => 
            rule.condition.includes(`(${unit})`)
          );
  
          for (const rule of unitRules) {
            const baseValue = Number(rule.baseValue);
            const variation = Number(rule.variationIncrement);
            
            if (value > baseValue) {
              const extra = value - baseValue;
              const increments = Math.ceil(extra / variation);
              unitPrice += increments * variation;
            }
          }
        }
      }
  
      return Number(unitPrice.toFixed(2));
    } catch (error) {
      console.error('Error calculating unit price:', error);
      throw new Error('Failed to calculate unit price');
    }
  };

  // Calculates the grand total for all orders
  private calculateGrandTotal = (orders: any[]): number => {
    return orders.reduce((total, order) => {
      return total + (order.unitPrice * (order.quantity || 1));
    }, 0);
  };

  // helper function to create orders for quote
  private createOrdersForQuote = async (data: CreateOrderForQuote): Promise<void> => {
    const { quoteId, items, createdBy } = data;
    
    for (const item of items) {
      // Calculate unit price for each order item
      const unitPrice = await this.calculateUnitPrice(item);
      
      // Create order with calculated unit price
      await this.orderService.createOrder({
        ...item,
        quoteId,
        unitPrice,  
        createdBy,
      });
    }
  };
  
  // helper function to sync orders for quote
  private syncQuoteOrders = async (data: SyncOrderForQuote): Promise<void> => {
    const { quoteId, newItems, createdBy } = data;
    const existingOrders = await this.orderService.getOrdersByQuoteId(quoteId);
    
    // Handle updates and creates
    for (const item of newItems) {
      const unitPrice = await this.calculateUnitPrice(item);
      
      if (item._id) {
        // Update existing order
        await this.orderService.updateOrder(item._id, {
          ...item,
          unitPrice,
          quoteId,
          createdBy,
        });
      } else {
        // Create new order
        await this.orderService.createOrder({
          ...item,
          unitPrice,
          quoteId,
          createdBy,
        });
      }
    }
    
    // Handle deletes
    const newItemIds = new Set(newItems.map(item => item._id?.toString()).filter(Boolean));
    const ordersToDelete = existingOrders.filter(order => !newItemIds.has(order._id.toString()));
    await Promise.all(ordersToDelete.map(order => 
      this.orderService.deleteOrdersByQuoteId(order._id)
    ));
  };

  // Create quote and order
  public createQuote = async (payload: CreateQuote): Promise<Quote> => {
    const { items = [], paymentDetails, ...quoteData } = payload;
    
    // Upload payment details image
    if (paymentDetails?.checkImage) {
      const uploadedImage = await this.uploadService.create({
        file: paymentDetails.checkImage
      });
      paymentDetails.checkImage = uploadedImage._id;
    }
    
    // Calculate payment summary
    const paymentSummary = this.calculatePaymentSummary(
      quoteData.paymentStructure,
      paymentDetails
    );

    // Create the quote first
    let quote = await this.model.create({
      ...quoteData,
      paymentDetails,
      paymentSummary
    });
    
    // Create orders with calculated prices
    if (items.length > 0) {
      await this.createOrdersForQuote({
        quoteId: quote._id,
        items,
        createdBy: quote.createdBy
      });
      
      // Calculate grand total from created orders
      const orders = await this.orderService.getOrdersByQuoteId(quote._id);
      const grandTotal = this.calculateGrandTotal(orders);
      
      // Update quote with grand total
      quote = await this.model.update(quote._id, {
        paymentStructure: {
          ...quote.paymentStructure,
          grandTotal: parseInt(grandTotal.toString(), 10)
        }
      });
    }
    
    return quote;
  };
  
  // Update quote or order
  public updateQuote = async (id: string, payload: Partial<CreateQuote>): Promise<Quote> => {
    const { items, ...quoteData } = payload;
    let updatedQuote = await this.model.update(id, quoteData);
    
    if (items) {
      await this.syncQuoteOrders({
        quoteId: id,
        newItems: items,
        createdBy: updatedQuote.createdBy
      });
      
      // Calculate payment summary
      const paymentSummary = this.calculatePaymentSummary(
        updatedQuote.paymentStructure,
        updatedQuote.paymentDetails
      );

      // Recalculate grand total
      const orders = await this.orderService.getOrdersByQuoteId(id);
      const grandTotal = this.calculateGrandTotal(orders);
      
      // Update quote with new grand total
      updatedQuote = await this.model.update(id, {
        paymentStructure: {
          ...updatedQuote.paymentStructure,
          paymentSummary,
          grandTotal: parseInt(grandTotal.toString(), 10)
        }
      });
    }
    
    return updatedQuote;
  };

  // Upload document from onsite visit
  public updateQuoteDocuments = async (
    id: string, 
    payload: UploadDocuments
  ): Promise<Quote> => {
    const updateData: any = {};
  
    // Handle document additions
    if (payload.addDocuments && payload.addDocuments.length > 0) {
      const uploadPromises = payload.addDocuments.map(file => 
        this.uploadService.create({
          file
        })
      );
  
      const uploadedDocs = await Promise.all(uploadPromises);
      updateData.$push = { 
        documents: { $each: uploadedDocs.map(doc => doc._id) } 
      };
    }
  
    // Handle document removals
    if (payload.removeDocuments && payload.removeDocuments.length > 0) {
      const objectIds = payload.removeDocuments.map(id => 
        typeof id === 'string' ? new Types.ObjectId(id) : id
      );
      
      updateData.$pull = { 
        documents: { $in: objectIds } 
      };
    }
  
    await this.model.update(id, updateData);
    const populatedData = await this.getPopulatedData(id);
    return populatedData;
  }

  // Get all quotes
  public getQuotes = async (params: GetQuotesParams, userId: string): Promise<QuoteResponse[] | QuotePaginatedResponse<QuoteResponse>> => {
    const { search, sort, source, status, ...restParams } = params;
    let query: any = { ...restParams };

    // Get user data
    const user = await this.userService.getById(userId)
    if(user.role === 'salesperson') {
     query.createdBy = userId
    }

    // Build search query 
    if (search || source || status) {
        const appointmentQuery: any = {};
        
        if (search) {
            appointmentQuery.$or = [
              { 
                $expr: {
                  $regexMatch: {
                    input: { $concat: ['$firstName', ' ', '$lastName'] },
                    regex: search,
                    options: 'i'
                  }
                }
              },
              { lastName: { $regex: search, $options: 'i' } },
              { emailAddress: { $regex: search, $options: 'i' } },
              { address1: { $regex: search, $options: 'i' } },
              { city: { $regex: search, $options: 'i' } },
              { zipCode: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (source) {
            appointmentQuery.source = source;
        }
        
        if (status) {
          appointmentQuery.status = { $regex: new RegExp(`^${status}$`, 'i') };
      }

        const appointmentModel = this.appointmentModel.getMongooseModel();
        const matchingAppointments = await appointmentModel?.find(appointmentQuery).distinct('_id');
        
        query.appointmentId = { $in: matchingAppointments };
      }

      // Sort query
      if (sort) {
        query.status = {$regex: new RegExp(`^${sort}$`, 'i')};
      }
      const quotes = await this.model.getAll(query);

      // Helper to calculate totalGrandTotal
      const calculateTotalAmount = (quotesArr: Quote[]) => {
        return quotesArr.reduce(
          (sum, q) => sum + (q.paymentStructure?.grandTotal || 0),
          0
        );
      };

      // paginated response
      if (quotes && 'result' in quotes && 'pagination' in quotes) {
          const populatedQuotes = await Promise.all(
              quotes.result.map((quote: Quote) => this.getPopulatedData(quote._id!))
          );

          // Calculate total grand total
          const totalAmount = calculateTotalAmount(populatedQuotes);

          return {
              result: populatedQuotes,
              totalAmount,
              pagination: quotes.pagination,
          };
      }

      // non-paginated response
      const populatedQuotes = await Promise.all(
          quotes.map((quote: Quote) => this.getPopulatedData(quote._id!))
      );
      return {
        ...populatedQuotes,
        totalAmount: calculateTotalAmount(populatedQuotes)
      }
  }
  
  // Get analytics
  public getSalesPersonAnalytics = async (params: any, userId: string): Promise<SalesPersonAnalytics> => {
    const allQuotes = (await this.getQuotes({}, userId)) as QuoteResponse[];
    
    const userAppointments = await this.appointmentModel.getMongooseModel()?.find({
      $or: [
        { createdBy: new Types.ObjectId(userId) },
        { assignedTo: new Types.ObjectId(userId) }
      ]
    }).lean();

    const quotedAppointmentIds = new Set(
      allQuotes.map(quote => quote.appointmentId?.toString())
    );
  
    let leads = 0;
    let quoted = 0;
    let sold = 0;
  
    userAppointments?.forEach(appointment => {
      const status = appointment.status?.toLowerCase();
      const hasQuote = quotedAppointmentIds.has(appointment._id.toString());
      
      if (status === 'sold' || status === 'Sold') {
        sold++;
      } else if (status === 'quoted' || status === 'Quoted') {
        quoted++;
      } else if (!hasQuote && (status === 'scheduled' || status === 'Scheduled')) {
        leads++;
      }
    });
  
    return {
      customers: allQuotes.length, 
      leads,
      quoted,
      sold
    };
}
}