import { BaseController } from '../../common/core/baseController'
import { ProductService } from './productService'
import { Product } from './productInterface'
import { Request, Response } from 'express'
import { apiResponse } from '../../common/utils/apiResponse'

export class ProductController extends BaseController<Product, ProductService> {
  constructor(productService: ProductService) {
    super(productService)
  }

  public create = async (req: Request, res: Response): Promise<void> => {
    const payload ={
      ...req.body,
      image: req.file,
      createdBy: req.user!.id
    }
      const data = await this.service.createProduct(payload)
      apiResponse(res, data, 201, "Product created successfully")
  }

  public getAll = async (req: Request, res: Response): Promise<void> => {
    const data = await this.service.getProducts(req.query)
    apiResponse(res, data, 200, "Products fetched successfully")
  }

  public update = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;
    const updateData: Product = {
      ...req.body,
      image: req.file,
    };

    const item = await this.service.updateProduct(id, updateData);
    apiResponse(res, item, 200, "Product updated successfully");
  }

  public delete = async (req: Request, res: Response): Promise<void> => {
    const data = await this.service.deleteProduct(req.params.id)
    apiResponse(res, data, 200, "Product deleted successfully")
  }

  public search = async (req: Request, res: Response): Promise<void> => {
    const data = await this.service.searchProducts(req.query)
    apiResponse(res, data, 200, "Products fetched successfully")
  }
}
