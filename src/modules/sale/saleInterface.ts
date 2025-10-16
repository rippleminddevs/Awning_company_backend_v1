export interface Sale {
  counts: Array<{
    revenue?: number;
    soldItems?: number;
    newOrders?: number;
    change: number;
    isUp: boolean;
  }>;
  salesAnalytics: any;
  orderStats: any;
}
export interface SalesOverview{
  sortCounts: string
  sortSalesAnalytics: string
  sortOrderStats: string
}

export interface CurrentOrder {
  _id: string;
  customerName: string;
  address: string;
  phoneNumber: string;
  email: string;
  staffName: string;
  invoiceNumber?: string
  quoteId: string;
  date: Date;
  InvoiceAmount: number;
  paymentStatus: string;
  status: string
}

export interface GetCurrentOrdersParams {
  paginate?: boolean;
  page?: number;
  perPage?: number;
  search?: string;
}

export interface SalesReport {
  counts: Array<{
    sales?: number;
    quotations?: number;
    orders?: number;
    change: number;
    isUp: boolean;
  }>;
  salesAnalytics: any;
  orderStats: any;
}

export interface SalesReportResponse {
  analytics: SalesReport
  tableData?:any
  staffDetails?:any
}

export interface SalesReportParams {
  sortCounts: string
  sortSalesAnalytics: string
  sortOrderStats: string
  paginate?: boolean
  page?: number
  perPage?: number
}

export interface DashboardAnalytics {
  sortCounts: string
  sortSalesAnalytics: string
  sortOrderStats: string
}

export interface DashboardAnalyticsResponse {
  analytics: {
    totalCustomers: number;
    newLeads: number;
    totalSales: number;
    salesAnalytics: any[];
    orderStats: any[];
  };
}