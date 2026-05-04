import { Order } from '../order/orderInterface'

export interface PaymentStructure {
  msrp: string
  discount: string
  discountedSalesPrice: string
  salesTax: string
  installationCharges: string
  hiddenMarkup: string
  upfrontDeposit: string
  numberOfInstallments: string
  grandTotal: number
  freight?: string
  additionalInstallationCharges?: string
}

export interface PaymentSummary {
  dueAcceptance: string
  installments: string
  duePriorDelivery: string
  balanceCompletion: string
  subtotal: string
  discount: string
  taxes: string
  freight: string
  total: string
}

export interface PaymentDetails {
  paymentMethod?: string

  // Credit / Debit Card
  cardHolderName?: string
  cardNumber?: string
  cardExpiry?: string
  emailAddress?: string

  // Check
  checkNumber?: string
  checkImage?: string

  // Wire Transfer
  accountHolderName?: string
  billingAddress?: string
  wireAmount?: string
  bankName?: string
  accountNumber?: string
  swiftBIC?: string
  routingNumber?: string

  // ACH Transfer
  accountType?: string
  authorization?: string
  date?: string | Date
  signature?: string
}

export interface FabricRef {
  id: string
  number: string
  name: string
}

export interface OptionGroupSelection {
  yn?: string
  sub_slug?: string
  qty?: number
  brand?: string
  price?: number
  sub_fields?: Record<string, any>
}

export interface LineItemV2 {
  product_type_id: string
  product_type_slug: string
  product_name: string
  dimensions: Record<string, any>
  fabric: FabricRef | null
  unitPrice: number
  optionsTotal: number
  installPrice: number
  options_map: Record<string, OptionGroupSelection>
  line_total: number
  drive_type?: string
}

export interface Quote {
  _id?: string
  appointmentId: string
  documents: string[]
  customer_signature?: string
  status?:
    | 'Hot'
    | 'Warm'
    | 'Dead'
    | 'SOLD'
    | 'CALL BACK'
    | 'LEFT PHONE MESSAGE'
    | 'QUOTED'
    | 'CANCELLED'
    | 'NO SHOW'
    | 'FOLLOWED UP'
    | 'UNAVAILABLE'
    | 'CONFIRMED'
    | 'NO CAN DO'
    | 'AWAITING QUOTE'
    | 'SALE PENDING'
    | 'TENTATIVE APT'
    | 'SCHEDULED'
    | 'LEFT VOICEMAIL'
    | 'COMPLETE'
    | 'NEW LEADS'
    | 'COMING TO SHOWROOM'
  paymentStructure: PaymentStructure
  paymentDetails: PaymentDetails
  paymentSummary: PaymentSummary
  invoice?: string
  paymentStatus?: 'pending' | 'paid' | 'partially paid'
  createdBy: string
  createdAt?: Date
  updatedAt?: Date
  line_items_v2?: LineItemV2[]
  quote_notes?: string
}

export interface QuoteResponse {
  _id?: string
  appointmentId: string
  documents: string[]
  status?: Quote['status']
  paymentStructure: PaymentStructure
  paymentDetails: PaymentDetails
  paymentSummary: PaymentSummary
  invoice?: string
  createdBy: string
  createdAt?: Date
  updatedAt?: Date
  totalAmount?: number
}

export interface CreateQuote extends Omit<Quote, '_id' | 'createdAt' | 'updatedAt'> {
  items: LineItemV2[]
}

export interface QuoteWithItems extends Quote {
  items: Order[]
}

export interface CalculatePriceResponse {
  subtotal: number
  tax: number
  total: number
  items: Array<{ id: string; unitPrice: number; quantity: number; total: number }>
}

export interface SyncOrderForQuote {
  quoteId: string
  newItems: LineItemV2[]
  createdBy: string
}

export interface CreateOrderForQuote {
  quoteId: string
  items: LineItemV2[]
  createdBy: string
}

export interface UploadDocuments {
  addDocuments: string[]
  removeDocuments: string[]
}

export interface GetQuotesParams {
  paginate?: boolean
  page?: number
  perPage?: number
  search?: string
  source?: string
  status?: string
  dateFilter?: string
  sort?: string
}

export interface InvoiceData {
  company: {
    logo: string
    address: string
    email: string
    office: string
    website: string
    license: string
    sponsers: string[]
  }
  salesperson: {
    name: string
    cell: string
    email: string
    quoteCreated: string
    quoteExpiry: string
    quoteNumber: string
  }
  customer: {
    name: string
    street: string
    cityZip: string
    source: string
    leadTime: string
  }
  project: {
    name: string
    street: string
    cityZip: string
  }
  billTo: {
    name: string
    street: string
    cityZip: string
  }
  items: Array<{
    qty: number
    image: string
    title: string
    fields: Array<{ label: string; value: string; key?: string }>
    options: Array<{ label: string; detail: string; yn: string; qty: string; price: string }>
    fabric?: { number: string; name: string } | null
    unitPrice: string
    optionsTotal: string
    installPrice: string
    subTotal: string
    isNote: boolean
    noteText: string
  }>
  summary: {
    subtotal: string
    discount: string
    taxes: string
    grandTotal: string
  }
  payment: {
    numberOfInstallments: string
    downPayment: string
    balanceDue: string
    paymentMethod: string
  }
  officeOnly: {
    customerName: string
    salesPerson: string
    saleDate: string
    depositReceived: string
    depositSource: string
    leadTime: string
    hiddenMarkup: string
  }
  terms: string[]
  signatureData?: {
    sign: string
    date: string
  }
}

export interface SalesPersonAnalytics {
  customers: number
  leads: number
  quoted: number
  sold: number
}

export interface InvoiceResponse {
  url: string
  fileName: string
  size: number
  sizeHuman: string
  mimeType: string
  fileId: string
}

export interface GetTransactionsParams {
  paginate?: boolean
  page?: number
  perPage?: number
  search?: string
  status?: string
}

export interface TransactionResponse {
  _id?: string
  customerName: string
  product: string
  image: string
  orderId: string
  amount: string
  paymentMethod: string
  date: string
  status: string
  invoiceUrl?: string
}

export interface PopulatedProduct {
  _id: string
  name: string
  image?: {
    url: string
    [key: string]: any
  }
}

export interface AnalyticsResponse {
  analytics: Array<{
    completedPayments?: number
    pendingPayments?: number
    change: number
    isUp: boolean
  }>
}

export interface UpdatePaymentStatus {
  paymentStatus: string
}
