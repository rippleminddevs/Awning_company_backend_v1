export interface TrackingDashboardParams {
  sortCounts: string
  sortSalesAnalytics: string
  sortOrderStats: string
}

export interface TrackingDashboardResponse {
  analytics: {
    totalCustomers: number
    totalUsers: number // Changed from newLeads to totalUsers
    totalSales: number
    salesAnalytics: any[]
    orderStats: any[]
  }
}
