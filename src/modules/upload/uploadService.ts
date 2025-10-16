import { BaseService } from '../../common/core/baseService'
import { UploadModel } from './uploadModel'
import { Upload } from './uploadInterface'
import { uploadFile } from '../../common/utils/fileUpload'
import { config } from '../../services/configService'

export class UploadService extends BaseService<Upload> {
  constructor() {
    super(UploadModel.getInstance())
  }

  public create = async (data: any): Promise<Upload> => {
    const { path, url, domain } = await uploadFile({
      name: data.file.originalname,
      stream: data.file.buffer,
      mimetype: data.file.mimetype
    })

    const newUpload = await this.model.create({
      filename: data.file.originalname,
      originalName: data.file.originalname,
      size: data.file.size,
      mimeType: data.file.mimetype,
      path,
      url,
      uploadedHost: domain,
      isPublic: true,
      user: data.userId || null,
      metadata: {},
    })

    if (!newUpload) {
      throw new Error('Failed to create upload record')
    }

    return newUpload
  }

  public getById = async (id: string): Promise<Upload> => {
    const uploadModel = this.model.getMongooseModel()
    return uploadModel.findById(id).populate('user').lean()
  }

  public async createDefaultAvatar(): Promise<Upload> {
    const defaultAvatarPath = 'static/uploads/defaults/default_avatar.png';

    // Check if default avatar already exists
    const existingAvatar = await this.model.getOne({
      originalName: 'default_avatar.png',
      isPublic: true
    });

    if (existingAvatar) {
      return existingAvatar;
    }

    // Create default avatar upload record
    return await this.model.create({
      filename: 'default_avatar.png',
      originalName: 'default_avatar.png',
      size: 0, // Will be updated after file read
      mimeType: 'image/png',
      path: defaultAvatarPath,
      url: `${config.app.url}/static/uploads/defaults/default_avatar.png`,
      uploadedHost: 'local',
      isPublic: true,
      metadata: {
        isDefaultAvatar: true
      }
    });
  }
}
