import { Request, Response, NextFunction } from 'express'
import { AppError } from '../common/utils/appError'
import { UserModel } from '../modules/user/userModel'

// In authorization.ts
export const requiredRole = (roles: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user?.id) {
                throw AppError.unauthorized('User not authenticated');
            }

            const user = await UserModel.getInstance().getMongooseModel()?.findById(req.user.id);
            if (!user) {
                throw AppError.unauthorized('User not found');
            }

            if (!user.role || !roles.includes(user.role)) {
                throw AppError.unauthorized('You don\'t have permission to access this resource');
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};
