import { Order } from "../order/orderInterface";

export interface PaymentStructure {
  upfrontDeposit: string;
  numberOfInstallments: string;
  paymentMethod: string;
  hiddenMarkup: string;
  MSRP: string;
  discount: string;
  discountedSalesPrice: string;
  salesTax: string;
  InstallationCharges: string;
  grandTotal: number;
  freight?: string;
}

export interface PaymentSummary {
  dueAcceptance: string;
  installments: string;
  duePriorDelivery: string;
  balanceCompletion: string;
  subtotal: string;
  discount: string;
  taxes: string;
  freight: string;
  total: string;
}

export interface PaymentDetails {
  // Credit/Debit Card
  cardHolderName?: string;
  cardNumber?: string;
  cardExpiry?: string;
  emailAddress?: string;
  
  // Check
  checkNumber?: string;
  checkImage?: string;
  
  // Wire Transfer
  accountHolderName?: string;
  billingAddress?: string;
  wireAmount?: string;
  bankName?: string;
  accountNumber?: string;
  swiftBIC?: string;
  routingNumber?: string;
  
  // ACH Transfer
  accountType?: string;
  authorization?: string;
  date?: string | Date;
  signature?: string;
}

export interface QuoteItem {
  _id: any;
  productName: string;
  width_ft: string | number;
  width_in: string | number;
  widthFraction: string;
  height_ft: string | number;
  height_in: string | number;
  heightFraction: string;
  projection_ft: string | number;
  projection_in: string | number;
  projectionFraction: string;
  hardwareColor: string;
  fabric: string;
  valancaHeight: string;
  valancaStyle: string;
  bindingColor: string;
  installation: string;
  story: string;
  frameUpgrade: string;
  frameUpgradePercentage: string;
  description: string;
}

export interface Quote {
  _id?: string;
  appointmentId: string;
  documents: string[];
  status?: string;
  paymentStructure: PaymentStructure;
  paymentDetails: PaymentDetails;
  paymentSummary: PaymentSummary;
  invoice?: string;
  paymentStatus?: 'pending' | 'paid' | 'partially paid';
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface QuoteResponse {
  _id?: string;
  appointmentId: string;
  documents: string[];
  status?: string;
  paymentStructure: PaymentStructure;
  paymentDetails: PaymentDetails;
  paymentSummary: PaymentSummary;
  invoice?: string;
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
  totalAmount?: number;
}

export interface CreateQuote extends Omit<Quote, '_id' | 'createdAt' | 'updatedAt'> {
  items: QuoteItem[];
}

export interface QuoteWithItems extends Quote {
  items: Order[];
}

export interface CalculatePriceResponse {
  subtotal: number;
  tax: number;
  total: number;
  items: Array<{ id: string; unitPrice: number; quantity: number; total: number }>;
}

export interface CalculateUnitPriceResponse {
  unitPrice: number;
  additionalCosts: number;
}

export interface SyncOrderForQuote {
  quoteId: string, 
  newItems: any[], 
  createdBy: string
}

export interface CreateOrderForQuote {
  quoteId: string, 
  items: any[], 
  createdBy: string
}

export interface UploadDocuments {
  addDocuments: string[];
  removeDocuments: string[];
}

export interface GetQuotesParams {
  paginate?: boolean;
  page?: number
  perPage?: number
  search?: string
  sort?: string
  source?: string
  status?: string
}

export interface InvoiceData {
  company: {
    logo: string;
    address: string;
    email: string;
    office: string;
    license: string;
    representative: string;
    direct: string;
    sponsorImage?: string;
  };
  salesperson: {
    name: string;
    phone: string;
    email: string;
    quoteCreated: string;
    quoteExpiry: string;
  };
  customer: {
    quoteId: string;
    name: string;
    phone: string;
    email: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    jobLocation: string;
    leadTime: string;
    installTime: string;
  };
  items: Array<{
    qty: number;
    unitPrice: string;
    extendedPrice: string;
    image: string;
    title: string;
    description: string;
    location?: string;
    options?: string[];
    size?: string;
    color?: string;
    notes?: string[];
  }>;
  summary: {
    subtotal: string;
    discount: string;
    taxes: string;
    freight: string;
    total: string;
  };
  payment: {
    dueAcceptance: string;
    installments: string;
    duePriorDelivery: string;
    balanceCompletion: string;
  };
  terms: string[];
}

export interface SalesPersonAnalytics{
  customers: number;
  leads: number;
  quoted: number;
  sold: number;
}