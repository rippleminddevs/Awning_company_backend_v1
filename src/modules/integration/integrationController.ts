import { BaseController } from '../../common/core/baseController'
import { IntegrationService } from './integrationService'
import { Integration } from './integrationInterface'
import { Request, Response } from 'express'
import { apiResponse } from '../../common/utils/apiResponse'

export class IntegrationController extends BaseController<Integration, IntegrationService> {
  constructor(integrationService: IntegrationService) {
    super(integrationService)
  }

  public createSMTP = async (req: Request, res: Response): Promise<void> => {

    if (!req.user || !req.user.id) {
      throw new Error('User not found');
    }

    const payload: Integration = {
      ...req.body,
      createdBy: req.user.id
    }
    const result = await this.service.createSMTP(payload)
    apiResponse(res, result, 201, "SMTP integrated successfully")
  }

  public createMailChimp = async (req: Request, res: Response): Promise<void> => {

    if (!req.user || !req.user.id) {
      throw new Error('User not found');
    }

    const payload: Integration = {
      ...req.body,
      createdBy: req.user.id
    }
    const result = await this.service.createMailChimp(payload)
    apiResponse(res, result, 201, "MailChimp integrated successfully")
  }

  public createThirdPartyTool = async (req: Request, res: Response): Promise<void> => {

    if (!req.user || !req.user.id) {
      throw new Error('User not found');
    }

    const payload: Integration = {
      ...req.body,
      createdBy: req.user.id
    }
    const result = await this.service.createThirdPartyTool(payload)
    apiResponse(res, result, 201, "Third party tools integrated successfully")
  }

  public createNotificationSetting = async (req: Request, res: Response): Promise<void> => {

    if (!req.user || !req.user.id) {
      throw new Error('User not found');
    }

    const payload: Integration = {
      ...req.body,
      createdBy: req.user.id
    }
    const result = await this.service.createNotificationSetting(payload)
    apiResponse(res, result, 201, "Notification setting integrated successfully")
  }

  public update = async (req: Request, res: Response): Promise<void> => {

    if (!req.user || !req.user.id) {
      throw new Error('User not found');
    }

    const payload: Integration = {
      ...req.body,
      createdBy: req.user.id
    }
    const result = await this.service.updateIntegration(req.params.id, payload)
    apiResponse(res, result, 200, "Integration updated successfully")
  }

  public getAll = async (req: Request, res: Response): Promise<void> => {
    const integrations = await this.service.getAllIntegrations();
    apiResponse(res, integrations, 200, "Integrations fetched successfully");
  }

  public getById = async (req: Request, res: Response): Promise<void> => {
    const integration = await this.service.getIntegrationById(req.params.id);
    apiResponse(res, integration, 200, "Integration fetched successfully");
  }
}
