import { BaseController } from '../../common/core/baseController'
import { OptionItemService } from './optionItemService'
import { OptionItem } from './optionItemInterface'
import { Request, Response } from 'express'
import { apiResponse } from '../../common/utils/apiResponse'
import { AppError } from '../../common/utils/appError'

export class OptionItemController extends BaseController<OptionItem, OptionItemService> {
  constructor(optionItemService: OptionItemService) {
    super(optionItemService)
  }

  public getByGroup = async (req: Request, res: Response): Promise<void> => {
    const { groupId } = req.params
    const data = await this.service.getByGroup(groupId)
    apiResponse(res, data, 200)
  }

  public createForGroup = async (req: Request, res: Response): Promise<void> => {
    const { groupId } = req.params
    const data = await this.service.create({ ...req.body, group_id: groupId })
    apiResponse(res, data, 201)
  }

  public updateForGroup = async (req: Request, res: Response): Promise<void> => {
    const { itemId } = req.params
    if (!itemId) throw AppError.badRequest('Item ID is required')
    const data = await this.service.update(itemId, req.body)
    apiResponse(res, data, 200)
  }

  public deleteForGroup = async (req: Request, res: Response): Promise<void> => {
    const { itemId } = req.params
    if (!itemId) throw AppError.badRequest('Item ID is required')
    await this.service.delete(itemId)
    apiResponse(res, { message: 'Item deleted successfully' }, 200)
  }
}
