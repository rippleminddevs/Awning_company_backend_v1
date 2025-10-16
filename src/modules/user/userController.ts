import { BaseController } from '../../common/core/baseController'
import { UserService } from './userService'
import { GetSalesPersonsParams, User, UserUpdate } from './userInterface'
import { Request, Response } from 'express'
import { apiResponse } from '../../common/utils/apiResponse'
import { AppError } from '../../common/utils/appError'

export class UserController extends BaseController<User, UserService> {
  constructor(userService: UserService) {
    super(userService)
  }

  public create = async (req: Request, res: Response) => {
    const userData: User = {
      ...req.body,
     profilePicture: req.file,
    };
    const user = await this.service.createUser(userData);
    apiResponse(res, user, 201, "User created successfully");
  }

  public updateUsers = async (req: Request, res: Response) => {
    const id = req.user?._id || req.user?.id;
    if (!id) {
      throw AppError.badRequest('User ID is required');
    }

    const updateData: UserUpdate = {
      ...req.body,
      profilePicture: req.file
    };

    const user = await this.service.updateUser(id, updateData);
    apiResponse(res, user, 200, "User updated successfully");
  }

  public updateOwnProfile = async (req: Request, res: Response) => {
    const id = req.user?._id || req.user?.id;
    if (!id) {
      throw AppError.badRequest('User ID is required');
    }

    const updateData: UserUpdate = {
      ...req.body,
      profilePicture: req.file
    };

    const user = await this.service.updateOwnProfile(id, updateData);
    apiResponse(res, user, 200, "User updated successfully");
  }

  public updateFCMTokens = async (req: Request, res: Response): Promise<void> => {
    const { addfcmToken, removefcmToken } = req.body;
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      throw AppError.unauthorized('User not authenticated');
    }

    const updatedUser = await this.service.updateFCMTokens(
      {
        userId,
        addfcmToken,
        removefcmToken
      }
    );

    apiResponse(res, updatedUser, 200, "FCM tokens updated successfully");
  };

  public getUserById = async (req: Request, res: Response) => {
    const id = req.params.id || req.user?.id;
    if (!id) {
      throw AppError.badRequest('User ID is required');
    }

    const user = await this.service.getUserById(id);
    apiResponse(res, user, 200, "User fetched successfully");
  }

  public getSalesPersons = async (req: Request, res: Response): Promise<void> => {
    const users = await this.service.getSalesPersons(req.query as GetSalesPersonsParams);
    apiResponse(res, users, 200, "Sales representatives fetched successfully");
  }
}