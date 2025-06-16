import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import AppError from '../app/errors/AppError';
import { HTTP_STATUS } from '../app/constants';
import { env } from '../configs/envConfig';
import { User } from '../app/modules/user/user.model';
import catchAsync from '../app/utils/catchAsync';

// Extend Request interface to include user
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

const auth = (...requiredRoles: string[]) => {
  return catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    // Check if token exists
    if (!token) {
      throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'You are not authorized');
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as {
        userId: string;
        role: string;
      };

      // Check if user still exists
      const currentUser = await User.findById(decoded.userId);
      if (!currentUser) {
        throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'The user no longer exists');
      }

      // Check if user is deleted
      if (currentUser.isDeleted) {
        throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'The user is deleted');
      }

      // Check user role
      if (requiredRoles.length && !requiredRoles.includes(decoded.role)) {
        throw new AppError(HTTP_STATUS.FORBIDDEN, 'You are not authorized');
      }

      // Add user to request object
      req.user = decoded;
      next();
    } catch (error) {
      throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'You are not authorized');
    }
  });
};

export default auth; 