import { BaseController } from '../../common/core/baseController'
import { ProductTypeService } from './productTypeService'
import { ProductType } from './productTypeInterface'
import { apiResponse } from '../../common/utils/apiResponse'
import { Request, Response } from 'express'
import mongoose from 'mongoose'

export class ProductTypeController extends BaseController<ProductType, ProductTypeService> {
  constructor(productTypeService: ProductTypeService) {
    super(productTypeService)
  }

  public getAll = async (req: Request, res: Response): Promise<void> => {
    const { category_id }: any = req.query
    console.log('query', req.query);
    // const data = await this.service.getAll({ category_id: new mongoose.Types.ObjectId(category_id) })
    const data = await this.service.getAll({ 
      ...req.query,
      category_id: new mongoose.Types.ObjectId(category_id),
      sort: { sort_order: 1 } 
    })
    console.log('data', data);
    return apiResponse(res, data)
  }
}
