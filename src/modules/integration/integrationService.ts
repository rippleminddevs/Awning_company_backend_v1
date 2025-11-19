import { BaseService } from '../../common/core/baseService'
import { IntegrationModel } from './integrationModel'
import { Integration } from './integrationInterface'
import { encryptionService } from '../../services/encryptionService'

const SENSITIVE_FIELDS = {
  smtp: ['password'],
  mailChimp: ['apiKey']
} as const;

export class IntegrationService extends BaseService<Integration> {
  constructor() {
    super(IntegrationModel.getInstance());
  }

  // Encrypts data
  private encryptSensitiveData(data: Integration): Integration {
    return encryptionService.encryptFields(data, SENSITIVE_FIELDS);
  }

  // Decrypts data
  private decryptSensitiveData<T extends Integration | Integration[] | null>(data: T): T {
    if (Array.isArray(data)) {
      return data.map(item =>
        encryptionService.decryptFields(item, SENSITIVE_FIELDS)
      ) as T;
    }

    if (data) {
      return encryptionService.decryptFields(data, SENSITIVE_FIELDS) as T;
    }

    return data;
  }

  // Create integration
  public createSMTP = async (integration: Integration): Promise<Integration> => {

    // Check existing document
    const existingSMTP = await this.model.getAll();

    // Update existing if found
    if (existingSMTP.length > 0) {
      const updatedData = await this.updateIntegration(existingSMTP[0]._id!, integration);
      return this.decryptSensitiveData(updatedData);
    }

    const encryptedData = this.encryptSensitiveData(integration);
    const result = await this.model.create(encryptedData);
    return this.decryptSensitiveData(result);
  }

  // Create MailChimp
  public createMailChimp = async (integration: Integration): Promise<Integration> => {

    // Check existing document
    const existingMailChimp = await this.model.getAll();

    // Update existing if found
    if (existingMailChimp.length > 0) {
      const updatedData = await this.updateIntegration(existingMailChimp[0]._id!, integration);
      return this.decryptSensitiveData(updatedData);
    }

    const encryptedData = this.encryptSensitiveData(integration);
    const result = await this.model.create(encryptedData);
    return this.decryptSensitiveData(result);
  }

  // Third party tools
  public createThirdPartyTool = async (integration: Integration): Promise<Integration> => {

    // Check existing document
    const existingThirdPartyTool = await this.model.getAll();

    // Update existing if found
    if (existingThirdPartyTool.length > 0) {
      const updatedData = await this.updateIntegration(existingThirdPartyTool[0]._id!, integration);
      return this.decryptSensitiveData(updatedData);
    }

    const result = await this.model.create(integration);
    return result
  }

  // Notification Settings
  public createNotificationSetting = async (integration: Integration): Promise<Integration> => {

    // Check existing document
    const existingNotificationSetting = await this.model.getAll();

    // Update existing if found
    if (existingNotificationSetting.length > 0) {
      const updatedData = await this.updateIntegration(existingNotificationSetting[0]._id!, integration);
      return this.decryptSensitiveData(updatedData);
    }

    const result = await this.model.create(integration);
    return result
  }

  // Update integration
  public updateIntegration = async (id: string, integration: Integration): Promise<Integration> => {
    const encryptedData = this.encryptSensitiveData(integration);
    const result = await this.model.update(id, encryptedData);
    return this.decryptSensitiveData(result);
  }

  // Get all integrations
  public getAllIntegrations = async (): Promise<Integration[]> => {
    const integrations = await this.model.getAll();
    return this.decryptSensitiveData(integrations);
  }

  // Get integration by ID
  public getIntegrationById = async (id: string): Promise<Integration> => {
    const integration = await this.model.getById(id);
    return this.decryptSensitiveData(integration);
  }
}
