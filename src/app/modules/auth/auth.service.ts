import bcrypt from 'bcryptjs';
import AppError from '../../errors/AppError';
import { User } from '../user/user.model';
import { TLoginCredentials, TRegisterPayload, TChangePassword } from './auth.interface';
import { HTTP_STATUS, USER_ROLE } from '../../constants';
import { createToken } from '../../utils/auth';
import { env } from '../../../configs/envConfig';

const registerUser = async (payload: TRegisterPayload) => {
  // Check if user already exists
  const existingUser = await User.findOne({ email: payload.email });
  if (existingUser) {
    throw new AppError(HTTP_STATUS.CONFLICT, 'User already exists with this email');
  }

  // Create user with default role
  const userData = {
    ...payload,
    role: USER_ROLE.USER,
  };

  const result = await User.create(userData);
  return result;
};

const loginUser = async (payload: TLoginCredentials) => {
  // Check if user exists
  const user = await User.findOne({ 
    email: payload.email, 
    isDeleted: false 
  }).select('+password');

  if (!user) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, 'User not found');
  }

  // Check if password matches
  const isPasswordMatched = await bcrypt.compare(payload.password, user.password);
  if (!isPasswordMatched) {
    throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'Invalid credentials');
  }

  // Create JWT tokens
  const jwtPayload = {
    userId: user._id!.toString(),
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    env.JWT_ACCESS_SECRET,
    env.JWT_ACCESS_EXPIRES_IN
  );

  const refreshToken = createToken(
    jwtPayload,
    env.JWT_REFRESH_SECRET,
    env.JWT_REFRESH_EXPIRES_IN
  );

  return {
    accessToken,
    refreshToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

const changePassword = async (
  userId: string,
  payload: TChangePassword
) => {
  // Check if user exists
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, 'User not found');
  }

  // Check if old password matches
  const isOldPasswordMatched = await bcrypt.compare(
    payload.oldPassword,
    user.password
  );
  if (!isOldPasswordMatched) {
    throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'Old password is incorrect');
  }

  // Hash new password and update
  const hashedNewPassword = await bcrypt.hash(
    payload.newPassword,
    env.BCRYPT_SALT_ROUNDS
  );

  await User.findByIdAndUpdate(userId, {
    password: hashedNewPassword,
  });

  return null;
};

export const AuthServices = {
  registerUser,
  loginUser,
  changePassword,
}; 