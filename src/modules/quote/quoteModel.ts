import { FieldsConfig } from '../../common/interfaces/fieldTypes'
import { BaseModel } from '../../common/core/baseModel'
import { Quote } from './quoteInterface'
import { createMongooseSchema } from '../../common/utils/schemaUtils'

const PaymentStructure: FieldsConfig = {
  upfrontDeposit: { type: 'string', nullable: false },
  numberOfInstallments: { type: 'string', nullable: false },
  paymentMethod: { type: 'string', nullable: false },
  hiddenMarkup: { type: 'string', nullable: false },
  MSRP: { type: 'string', nullable: false },
  discount: { type: 'string', nullable: false },
  discountedSalesPrice: { type: 'string', nullable: false },
  salesTax: { type: 'string', nullable: false },
  InstallationCharges: { type: 'string', nullable: false },
  grandTotal: { type: 'number', nullable: false },
  freight: { type: 'string', nullable: true },
}

const PaymentSummary: FieldsConfig = {
  dueAcceptance: { type: 'string', nullable: true },
  installments: { type: 'string', nullable: true },
  duePriorDelivery: { type: 'string', nullable: true },
  balanceCompletion: { type: 'string', nullable: true },
  subtotal: { type: 'string', nullable: true },
  discount: { type: 'string', nullable: true },
  taxes: { type: 'string', nullable: true },
  freight: { type: 'string', nullable: true },
  total: { type: 'string', nullable: true },
}

const PaymentDetails: FieldsConfig = {
  // Credit/Debit Card
  cardHolderName: { type: 'string', nullable: true },
  cardNumber: { type: 'string', nullable: true },
  cardExpiry: { type: 'string', nullable: true },
  emailAddress: { type: 'string', nullable: true },
  
  // Check
  checkNumber: { type: 'string', nullable: true },
  checkImage:{
    type: 'string',
    mongooseType: 'ObjectId',
    ref: 'Upload',
    nullable: true
  },
  
  // Wire Transfer
  accountHolderName: { type: 'string', nullable: true },
  billingAddress: { type: 'string', nullable: true },
  wireAmount: { type: 'string', nullable: true },
  bankName: { type: 'string', nullable: true },
  accountNumber: { type: 'string', nullable: true },
  swiftBIC: { type: 'string', nullable: true },
  routingNumber: { type: 'string', nullable: true },
  
  // ACH Transfer
  accountType: { type: 'string', nullable: true },
  authorization: { type: 'string', nullable: true },
  date: { type: 'string', nullable: true },
  signature: { type: 'string', nullable: true },
}

const fields: FieldsConfig = {
  appointmentId: {
    type: 'string',
    mongooseType: 'ObjectId',
    ref: 'Appointment',
    nullable: false,
  },
  documents: {
    type: 'array',
    itemType: 'objectId',
    mongooseType: 'ObjectId',
    ref: 'Upload',
    nullable: true,
    default: [],
  },
  status: {
    type: 'string',
    nullable: true,
    enum: ['Hot', 'Warm', 'Dead'],
    default: 'Hot'
  },
  paymentStructure: {
    type: 'object',
    document: PaymentStructure,
    nullable: false,
    default: null
  },
  paymentDetails: {
    type: 'object',
    document: PaymentDetails,
    nullable: false,
    default: null
  },
  paymentSummary: {
    type: 'object',
    document: PaymentSummary,
    nullable: true,
    default: null
  },
  invoice: {
    type: 'string',
    mongooseType: 'ObjectId',
    ref: 'Upload',
    nullable: true,
    default: null
  },
  paymentStatus: {
    type: 'string',
    nullable: true,
    enum: ['pending', 'paid', 'partially paid'],
    default: 'pending'
  },
  createdBy: {
    type: 'string',
    mongooseType: 'ObjectId',
    ref: 'User',
    nullable: false,
  },
}

export class QuoteModel extends BaseModel<Quote> {
  private static instance: QuoteModel;
  constructor() {
    const schema = createMongooseSchema(fields,{
      includeTimestamps: true,
    })
    super('Quote', fields, schema)
  }

  public static getInstance(): QuoteModel {
    if (!QuoteModel.instance) {
      QuoteModel.instance = new QuoteModel();
    }
    return QuoteModel.instance;
  }
}
