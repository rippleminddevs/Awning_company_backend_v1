import { BaseService } from '../../common/core/baseService'
import { ProductModel } from './productModel'
import {
  GetProductsParams,
  Product,
  SearchProductsParams,
  GetSubProductsParams,
} from './productInterface'
import { UploadService } from '../../modules/upload/uploadService'
import { AppError } from '../../common/utils/appError'
import { isValidObjectId } from 'mongoose'

// Utility function to convert a string to camelCase
const toCamelCase = (str: string): string => {
  return str
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      if (index === 0) {
        return word
      }
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join('')
}

export class ProductService extends BaseService<Product> {
  private uploadService: UploadService
  constructor() {
    super(ProductModel.getInstance())
    this.uploadService = new UploadService()
  }

  // Common function to get populated item data
  public getPopulatedProduct = async (itemId: string): Promise<Product> => {
    const productModel = this.model.getMongooseModel()
    const item = await productModel
      .findById(itemId)
      .populate({
        path: 'image',
        select: 'url',
        model: 'Upload',
      })
      .populate({
        path: 'type',
        select: 'name',
        model: 'Category',
      })
      .populate({
        path: 'parentProduct',
        select: 'name',
        model: 'Product',
      })
      .lean()

    if (item.image) {
      item.image = item.image.url
    }
    if (item.type) {
      item.type = item.type.name
    }
    if (item.parentProduct) {
      item.parentProductInfo = {
        _id: item.parentProduct._id,
        name: item.parentProduct.name,
      }
      // Remove the parentProduct field to avoid duplication
      delete item.parentProduct
    }

    // Convert the name to camelCase
    const nameInCamelCase = toCamelCase(item.name)

    // Convert the type to camelCase
    const typeInCamelCase = toCamelCase(item.type)

    // Determine if this is a sub-product (has parentProductInfo)
    const isSubProduct = !!item.parentProductInfo

    // Create the combined field for sub-products only
    const nameWithTypeInCamelCase = isSubProduct ? nameInCamelCase + typeInCamelCase : undefined

    // Restructure the item to position parentProductInfo after type
    const reorderedItem = {
      _id: item._id,
      type: item.type,
      parentProductInfo: item.parentProductInfo,
      name: item.name,
      name_in_camel_case: nameInCamelCase,
      name_with_type_in_camel_case: nameWithTypeInCamelCase,
      colors: item.colors,
      installation: item.installation,
      hood: item.hood,
      description: item.description,
      width_fraction: item.width_fraction,
      width_ft: item.width_ft,
      width_in: item.width_in,
      height_ft: item.height_ft,
      image: item.image,
      pricing: item.pricing,
      createdBy: item.createdBy,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      __v: item.__v,
    }

    return reorderedItem
  }

  // Validate parent product
  private validateParentProduct = async (parentProductId?: string): Promise<void> => {
    if (!parentProductId) return

    if (!isValidObjectId(parentProductId)) {
      throw AppError.badRequest('Invalid parent product ID format')
    }

    const parentProduct = await this.model.getById(parentProductId)
    if (!parentProduct) {
      throw AppError.notFound('Parent product not found')
    }

    // Prevent sub-products from having their own sub-products
    if (parentProduct.parentProduct) {
      throw AppError.badRequest('Cannot create sub-product of another sub-product')
    }
  }

  // Create product
  public createProduct = async (payload: Product): Promise<Product> => {
    const { image, parentProduct, ...rest } = payload

    // Validate parent product if provided
    await this.validateParentProduct(parentProduct)

    const upload = await this.uploadService.create({
      file: image,
      userId: payload.createdBy,
    })

    const data = {
      ...rest,
      image: upload._id,
      parentProduct: parentProduct || null,
    }
    const item = await this.model.create(data)
    return this.getPopulatedProduct(item._id)
  }

  // Get products
  public getProducts = async (params: GetProductsParams): Promise<Product[]> => {
    let query: any = {}
    if (params.type) {
      query.type = params.type
    }

    // Get main products (no parent or null parent) - exclude actual sub-products
    query.$or = [
      { parentProduct: { $exists: false } }, // Older products without the field
      { parentProduct: null }, // Newer products with null parent
    ]

    const products = await this.model.getAll(query)
    const populatedProducts = await Promise.all(
      products.map((product: any) => this.getPopulatedProduct(product._id))
    )
    return populatedProducts
  }

  // Update products
  public updateProduct = async (id: string, payload: Product): Promise<Product> => {
    const existingProduct = await this.model.getById(id)
    if (!existingProduct) {
      throw AppError.notFound('Product not found')
    }

    if (payload.image) {
      const upload = await this.uploadService.create({
        file: payload.image,
        userId: existingProduct.createdBy,
      })

      payload.image = upload._id
      await this.uploadService.delete(existingProduct.image)
    }

    const updatedProduct = await this.model.update(id, payload)
    return this.getPopulatedProduct(updatedProduct._id)
  }

  // Delete products
  public deleteProduct = async (id: string): Promise<Product> => {
    const product = await this.model.delete(id)
    return this.getPopulatedProduct(product._id)
  }

  // Search products
  public searchProducts = async (params: SearchProductsParams): Promise<Product[]> => {
    let query: any = {}
    if (params.name) {
      query.$or = [
        { name: { $regex: params.name, $options: 'i' } },
        { description: { $regex: params.name, $options: 'i' } },
      ]
    }

    const products = await this.model.getAll(query)
    const populatedProducts = await Promise.all(
      products.map((product: any) => this.getPopulatedProduct(product._id))
    )
    return populatedProducts
  }

  // Get sub-products by parent product ID
  public getSubProducts = async (params: GetSubProductsParams): Promise<Product[]> => {
    const { parentProduct } = params

    if (!isValidObjectId(parentProduct)) {
      throw AppError.badRequest('Invalid parent product ID format')
    }

    // Check if parent product exists
    const parent = await this.model.getById(parentProduct)
    if (!parent) {
      throw AppError.notFound('Parent product not found')
    }

    // Get sub-products
    const query = { parentProduct }
    const subProducts = await this.model.getAll(query)
    const populatedSubProducts = await Promise.all(
      subProducts.map((product: any) => this.getPopulatedProduct(product._id))
    )

    return populatedSubProducts
  }

  // Get inventory analytics
  public getInventoryAnalytics = async (): Promise<any> => {
    const productModel = this.model.getMongooseModel()
    const categoryModel = (
      await import('../category/categoryModel')
    ).CategoryModel.getInstance().getMongooseModel()

    // Get all products with category population
    const allProducts = await productModel
      ?.find({})
      .populate({
        path: 'type',
        select: 'name',
        model: 'Category',
      })
      .lean()

    if (!allProducts || allProducts.length === 0) {
      return {
        totalProducts: 0,
        totalCategories: 0,
        productsByCategory: [],
        totalSubProducts: 0,
        productsWithoutImages: 0,
        productsWithPricing: 0,
      }
    }

    // Count products without parent (main products) vs with parent (sub-products)
    const mainProducts = allProducts.filter((product: any) => !product.parentProduct)
    const subProducts = allProducts.filter((product: any) => product.parentProduct)

    // Count products without images
    const productsWithoutImages = allProducts.filter((product: any) => !product.image).length

    // Count products with pricing information
    const productsWithPricing = allProducts.filter(
      (product: any) => product.pricing && product.pricing.basePrice > 0
    ).length

    // Count products by category using populated category names and IDs
    const categoryCounts: { [key: string]: { count: number; _id?: string; name?: string } } = {}
    mainProducts.forEach((product: any) => {
      if (product.type) {
        const categoryId =
          typeof product.type === 'string' ? product.type : product.type._id?.toString()
        const categoryName =
          typeof product.type === 'string'
            ? product.type
            : product.type.name || product.type._id?.toString()

        if (categoryId) {
          if (!categoryCounts[categoryId]) {
            categoryCounts[categoryId] = { count: 0, _id: categoryId, name: categoryName }
          }
          categoryCounts[categoryId].count++
        }
      }
    })

    // Format products by category for response
    const productsByCategory = Object.values(categoryCounts).map(({ _id, name, count }) => ({
      category: name, // use the category name as the main category field
      categoryId: _id, // include the ID as a separate field
      count,
    }))

    // Get total number of distinct categories
    let totalCategories = 0

    // Try to get actual category count if possible
    if (categoryModel) {
      try {
        totalCategories = await categoryModel.countDocuments({})
      } catch (error) {
        // Fallback to calculated distinct categories if category model is not accessible
        totalCategories = Object.keys(categoryCounts).length
      }
    }

    return {
      totalProducts: allProducts.length,
      totalCategories,
      productsByCategory,
      totalSubProducts: subProducts.length,
      productsWithoutImages,
      productsWithPricing,
    }
  }
}
