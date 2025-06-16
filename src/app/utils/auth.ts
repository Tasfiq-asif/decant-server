import jwt, { JwtPayload } from 'jsonwebtoken';
import { TJwtPayload } from '../modules/auth/auth.interface';

export const createToken = (
  jwtPayload: { userId: string; role: string },
  secret: string,
  expiresIn: string
): string => {
  return jwt.sign(jwtPayload, secret, { expiresIn } as any);
};

export const verifyToken = (token: string, secret: string): TJwtPayload => {
  return jwt.verify(token, secret) as TJwtPayload;
}; 