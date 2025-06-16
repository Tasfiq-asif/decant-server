export interface TLoginCredentials {
  email: string;
  password: string;
}

export interface TRegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface TChangePassword {
  oldPassword: string;
  newPassword: string;
}

export interface TJwtPayload {
  userId: string;
  role: string;
  iat?: number;
  exp?: number;
} 