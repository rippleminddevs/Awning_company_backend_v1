import { BaseService } from '../../common/core/baseService'
import { InventoryModel } from './inventoryModel'
import {
  AnalyticsResponse,
  GetInventoryParams,
  Inventory,
  InventoryResponse,
} from './inventoryInterface'
import { AppError } from '../../common/utils/appError'
import { PaginatedResponse } from '../../common/interfaces/globalInterfaces'
import { ProductModel } from '../product/productModel'

export class InventoryService extends BaseService<Inventory> {
  private productModel: ProductModel
  constructor() {
    super(InventoryModel.getInstance())
    this.productModel = ProductModel.getInstance()
  }

  // Return populated data
  private getPopulatedInventory = async (id: string): Promise<InventoryResponse> => {
    const inventoryModel = await this.model.getMongooseModel()
    const result: any = await inventoryModel
      .findById(id)
      .populate({
        path: 'awningType',
        select: 'name',
        model: 'Category',
      })
      .populate({
        path: 'product',
        select: 'name image',
        model: 'Product',
        populate: {
          path: 'image',
          select: 'url',
          model: 'Upload',
        },
      })
      .populate({
        path: 'createdBy',
        select: 'name email',
        model: 'User',
      })
      .lean()

    if (!result) {
      throw AppError.notFound('Inventory not found')
    }

    // Preserve original IDs and names to add them as separate fields
    const awningTypeId = result.awningType?._id?.toString() || result.awningType
    const productId = result.product?._id?.toString() || result.product

    // Store the names
    const awningTypeName = result.awningType?.name || null
    const productName = result.product?.name || null
    const productImage = result.product?.image?.url || null

    // Update the original fields to show IDs instead of names/populated data
    result.awningType = awningTypeId
    if (result.product) {
      result.product = productId // Just the ID, no longer populated object
    }

    // Add the names as separate fields
    result.awningTypeName = awningTypeName
    result.productName = productName
    result.productImage = productImage

    // Calculate status based on quantity
    if (result.quantity <= result.criticalLow) {
      result.status = 'Critical Low'
    } else if (result.quantity <= result.lowStock) {
      result.status = 'Low Stock'
    } else if (result.quantity >= result.sufficientStock) {
      result.status = 'Sufficient'
    } else {
      result.status = 'In Stock'
    }

    return result as InventoryResponse
  }

  // Create Inventory
  public createInventory = async (payload: Inventory): Promise<InventoryResponse> => {
    const inventory = await this.model.create(payload)

    if (!inventory) {
      throw AppError.notFound('Inventory not created')
    }

    return this.getPopulatedInventory(inventory._id || '')
  }

  // Update Inventory
  public updateInventory = async (id: string, payload: Inventory): Promise<InventoryResponse> => {
    const inventory = await this.model.update(id, payload)
    return this.getPopulatedInventory(inventory._id || '')
  }

  // Get Inventory
  public getInventories = async (
    params: GetInventoryParams
  ): Promise<InventoryResponse[] | PaginatedResponse<InventoryResponse>> => {
    const { search, ...restParams } = params
    let query: any = { ...restParams }

    // Search
    if (search) {
      const products = await this.productModel
        .getMongooseModel()
        ?.find({ name: { $regex: search, $options: 'i' } }, '_id')

      const productIds = products?.map(p => p?._id)
      query.product = { $in: productIds }
    }

    const inventory = await this.model.getAll(query)

    // paginated response
    if (inventory && 'result' in inventory && 'pagination' in inventory) {
      const populatedResults = await Promise.all(
        inventory.result.map((notification: any) =>
          this.getPopulatedInventory(notification._id.toString())
        )
      )

      return {
        result: populatedResults.filter(Boolean),
        pagination: inventory.pagination,
      }
    }

    // non-paginated response
    if (Array.isArray(inventory)) {
      const populatedResults = await Promise.all(
        inventory.map((notification: any) =>
          this.getPopulatedInventory(notification._id.toString())
        )
      )
      return populatedResults.filter(Boolean)
    }

    return []
  }

  // Delete Inventory
  public deleteInventory = async (id: string): Promise<InventoryResponse> => {
    const inventory = await this.model.delete(id)
    return this.getPopulatedInventory(inventory._id || '')
  }

  // Get inventory analytics
  public getInventoryAnalytics = async (): Promise<AnalyticsResponse> => {
    const now = new Date()
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

    // Get current and last month data
    const [current, last] = await Promise.all([
      // Current month data
      this.model
        .getMongooseModel()
        ?.aggregate([
          {
            $group: {
              _id: null,
              totalItems: { $sum: 1 },
              inStock: { $sum: { $cond: [{ $gt: ['$quantity', 0] }, 1, 0] } },
              outOfStock: { $sum: { $cond: [{ $lte: ['$quantity', 0] }, 1, 0] } },
            },
          },
        ])
        .then((res: any) => res[0] || { totalItems: 0, inStock: 0, outOfStock: 0 }),

      // Last month data
      this.model
        .getMongooseModel()
        ?.aggregate([
          {
            $match: {
              createdAt: { $gte: lastMonthStart, $lt: lastMonthEnd },
            },
          },
          {
            $group: {
              _id: null,
              totalItems: { $sum: 1 },
              inStock: { $sum: { $cond: [{ $gt: ['$quantity', 0] }, 1, 0] } },
              outOfStock: { $sum: { $cond: [{ $lte: ['$quantity', 0] }, 1, 0] } },
            },
          },
        ])
        .then((res: any) => res[0] || { totalItems: 0, inStock: 0, outOfStock: 0 }),
    ])

    // Calculate percentage change
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return { change: current > 0 ? 100 : 0, isUp: current > 0 }
      const change = parseFloat((((current - previous) / previous) * 100).toFixed(2))
      return { change, isUp: current >= previous }
    }

    return {
      analytics: [
        {
          totalItems: current.totalItems,
          ...calculateChange(current.totalItems, last.totalItems),
        },
        {
          inStock: current.inStock,
          ...calculateChange(current.inStock, last.inStock),
        },
        {
          outOfStock: current.outOfStock,
          ...calculateChange(current.outOfStock, last.outOfStock),
        },
      ],
    }
  }
}
