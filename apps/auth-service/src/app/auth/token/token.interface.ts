import moment from 'moment';
import { User } from '@nx-nestjs-boilerplate-server/sqlml'

export interface IToken {
  id: string;
  userId: string;
  token: string;
  tokenType: string;
  expires: Date;
  blackListed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPayload {
  sub: string;
  iat: number;
  exp: number;
  type: string;
}

export interface TokenPayload {
  token: string;
  expires: string;
}

export interface AccessAndRefreshTokens {
  access: TokenPayload;
  refresh: TokenPayload;
}

export interface ITokenService {
  generateToken(user: User, expires: moment.Moment, tokenType: string, secret: string): string;
  saveToken(token: string, user: User, expires: moment.Moment, tokenType: string, blackListed?: boolean): Promise<IToken>;
  verifyToken(token: string, tokenType: string): Promise<IToken>;
  generateAuthTokens(user: User): Promise<AccessAndRefreshTokens>;
  generateResetPasswordToken(email: string): Promise<{ resetPasswordToken: string; otp: string }>;
  generateVerifyEmailToken(user: User): Promise<{ emailToken: string; otp: string }>;
  blacklistToken(user: User, token: string, blackListed: boolean);
}
