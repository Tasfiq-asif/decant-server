import { USER_ROLE, USER_STATUS } from "../../constants";
import { Types } from "mongoose";

export interface TUser {
  _id?: string;
  name: string;
  email: string;
  password: string;
  role: string;
  status: string;
  isDeleted: boolean;
  profileImg?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TLoginUser {
  email: string;
  password: string;
}

export interface TRegisterUser {
  name: string;
  email: string;
  password: string;
}

export interface TAuthUser {
  userId: string;
  role: string;
  iat: number;
  exp: number;
}
