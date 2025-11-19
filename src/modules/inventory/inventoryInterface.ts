export interface Inventory {
  _id?: string
  awningType: string
  product: string
  updateType: 'Add' | 'Remove'
  quantity: number
  storageLocation: string
  reason?: string
  sufficientStock: number | string
  lowStock: number | string
  criticalLow: number | string
  reorderThreshold: number | string
  sku?: string
  createdBy: string
}

export interface GetInventoryParams {
  paginate?: string
  page?: string
  perPage?: string
  search?: string
}

export interface InventoryResponse {
  _id?: string
  awningType: string
  product: string
  updateType: 'Add' | 'Remove'
  quantity: number
  storageLocation: string
  reason?: string
  sufficientStock: number | string
  lowStock: number | string
  criticalLow: number | string
  reorderThreshold: number | string
  sku?: string
  status?: string
  createdBy: string
}

export interface AnalyticsResponse {
  analytics: Array<{
    totalItems?: number;
    inStock?: number;
    outOfStock?: number;
    change: number;
    isUp: boolean;
  }>;
}