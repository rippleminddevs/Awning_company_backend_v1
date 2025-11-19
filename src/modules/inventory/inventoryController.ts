import { BaseController } from '../../common/core/baseController'
import { InventoryService } from './inventoryService'
import { GetInventoryParams, Inventory } from './inventoryInterface'
import { Request, Response } from 'express'
import { apiResponse } from '../../common/utils/apiResponse'

export class InventoryController extends BaseController<Inventory, InventoryService> {
  constructor(inventoryService: InventoryService) {
    super(inventoryService)
  }

  public create = async (req: Request, res: Response): Promise<void> => {
     const payload : Inventory = {
      ...req.body,
      createdBy: req.user!.id,
     }
     const response = await this.service.createInventory(payload)
     apiResponse(res, response, 201, "Inventory created successfully")
  }

  public update = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params
    const payload: Inventory = {
      ...req.body,
      createdBy: req.user!.id,
    }
    const response = await this.service.updateInventory(id, payload)
    apiResponse(res, response, 200, "Inventory updated successfully")
  }

  public getAll = async (req: Request, res: Response): Promise<void> => {
    const params : GetInventoryParams = req.query
    const response = await this.service.getInventories(params)
    apiResponse(res, response, 200, "Inventories fetched successfully")
  }

  public delete = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params
    const response = await this.service.deleteInventory(id)
    apiResponse(res, response, 200, "Inventory deleted successfully")
  }

  public getAnalytics = async (req: Request, res: Response): Promise<void> => {
    const response = await this.service.getInventoryAnalytics()
    apiResponse(res, response, 200, "Inventory analytics fetched successfully")
  }
}
