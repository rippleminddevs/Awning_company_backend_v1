import { BaseService } from '../../common/core/baseService'
import { ProductCategoryModel } from './productCategoryModel'
import { ProductCategory } from './productCategoryInterface'

export class ProductCategoryService extends BaseService<ProductCategory> {
  constructor() {
    super(ProductCategoryModel.getInstance())
  }

  public getAll = async (params: any = {}): Promise<ProductCategory[]> => {
    return this.model.aggregate([
      {
        $lookup: {
          from: 'producttypes', // ⚠️ collection name (check exact name in MongoDB)
          localField: 'slug',
          foreignField: 'category_slug',
          as: 'products'
        }
      },
      {
        $addFields: {
          product_count: { $size: '$products' }
        }
      },
      {
        $project: {
          products: 0 // remove full product array (optional)
        }
      },
      {
        $sort: { sort_order: 1 }
      }
    ]);
    // return this.model.getAll({...params, sort: { sort_order: 1 }});
  }
}