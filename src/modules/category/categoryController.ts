import { BaseController } from '../../common/core/baseController'
import { CategoryService } from './categoryService'
import { Category } from './categoryInterface'
import { Request, Response } from 'express'
import { apiResponse } from '../../common/utils/apiResponse'


export class CategoryController extends BaseController<Category, CategoryService> {
  constructor(categoryService: CategoryService) {
    super(categoryService)
  }

  public create = async (req: Request, res: Response): Promise<void> => {
    const body ={
      ...req.body,
      createdBy: req.user!.id
    }
      const category = await this.service.create(body)
      apiResponse(res, category , 201, "Category created successfully")
  }

  public update = async (req: Request, res: Response): Promise<void> => {
    const body = {
      ...req.body,
      createdBy: req.user!.id
    }
    const category = await this.service.update(req.params.id, body)
    apiResponse(res, category, 200, "Category updated successfully")
  }

  public delete = async (req: Request, res: Response): Promise<void> => {
    const category = await this.service.delete(req.params.id)
    apiResponse(res, category, 200, "Category deleted successfully")
  }

  public getAll = async (req: Request, res: Response): Promise<void> => {
    const category = await this.service.getAll()
    apiResponse(res, category, 200, "Category fetched successfully")
  }

  public getById = async (req: Request, res: Response): Promise<void> => {
    const category = await this.service.getById(req.params.id)
    apiResponse(res, category, 200, "Category fetched successfully")
  }
}
