import { Injectable, UseFilters } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import moment from 'moment';
import Redis from 'ioredis';
import { RpcException } from '@nestjs/microservices';
import { HttpErrorTypes as grpcErrorTypes, HttpResponse as grpcResponse } from '@nx-nestjs-boilerplate-server/http-handler';
import * as crypto from 'crypto';
import { User } from '@nx-nestjs-boilerplate-server/sqlml';
import { IToken, AccessAndRefreshTokens, ITokenService } from './token.interface';
import { tokenTypes } from './token.types';
import { generateTOTP, verifyTOTP } from '../security/otp.util';
import { TokenRepository } from './token.repository';
import { UserRepository } from '../auth.repository';

@Injectable()
export class TokenService implements ITokenService {
  private redisClient: Redis;

  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: TokenRepository,
  ) {
    this.redisClient = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT, 10),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB_INDEX, 10),
    });
  }

  generateToken(
    user: User, 
    expires: moment.Moment, 
    tokenType: string, 
    secret: string
  ): string {
    const _user = {
      id: user.id,
      email: user.email,
      isVerified: user.isVerified,
      isBlocked: user.isBlocked,
    }

    const signature = crypto.createHash('sha256').update(JSON.stringify({
      user: _user,
      expires: expires.unix(),
      signatureSecret: process.env.JWT_SIGNATURE_SECRET,
    })).digest('hex');
    const payload = {
      sub: { user: _user, signature },
      iat: moment().unix(),
      exp: expires.unix(),
      type: tokenType,
    };
    return this.jwtService.sign(payload, { secret });
  }

  async saveToken(token: string, user: User, expires: moment.Moment, tokenType: string, blackListed: boolean = false): Promise<IToken> {
    const tokenDoc = this.tokenRepository.create({
      userId: user.id,
      token,
      tokenType,
      expires: expires.toDate(),
      blackListed,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return await this.tokenRepository.save(tokenDoc);
  }

  async verifyToken(token: string, tokenType: string): Promise<IToken> {
    try {
      // console.log('token:', await this.jwtService.verify(token)); // this line is strage becose it was verify function berfore
      const payload = await this.jwtService.decode(token);
      console.log('payload:', payload);
      if (payload.type !== tokenType) {
        throw new RpcException(grpcErrorTypes.AUTH_TOKEN_BLACKLISTED);
      }

      const signature = crypto.createHash('sha256').update(JSON.stringify({
        user: payload.sub.user,
        expires: payload.exp,
        signatureSecret: process.env.JWT_SIGNATURE_SECRET,
      })).digest('hex');
      console.log('signature:', signature);
      if (signature !== payload.sub.signature) {
        throw new RpcException(grpcErrorTypes.AUTH_TOKEN_SIGNATURE_INVALID);
      }

      const tokenDoc = await this.tokenRepository.findValidToken(token, tokenType);
      if (!tokenDoc) {
        throw new RpcException(grpcErrorTypes.AUTH_TOKEN_BLACKLISTED);
      }
      console.log('tokenDoc:', tokenDoc);
      return tokenDoc;
    } catch (error) {
      throw new RpcException(grpcErrorTypes.AUTH_TOKEN_EXPIRED);
    }
  }

  async verifyEmailWithToken(token: string, otp: string): Promise<User> {
    const tokenDoc = await this.verifyToken(token, tokenTypes.VERIFY_EMAIL);
    const user = await this.userRepository.findOne({ where: { id: tokenDoc.userId } });
    if (!user) {
      throw new RpcException(grpcErrorTypes.USER_NOT_FOUND);
    }

    const otpIsValid = verifyTOTP(otp, process.env.OTP_SECRET);
    if (!otpIsValid) {
      throw new RpcException(grpcErrorTypes.AUTH_OTP_INVALID);
    }

    await this.tokenRepository.delete(
      { 
        user: { id: user.id }, 
        token, 
        tokenType: tokenTypes.VERIFY_EMAIL
      });
    user.isVerified = true;
    await this.userRepository.save(user);
    return user;
  }

  async verifyEmailWithOtp(user: User, otp: string): Promise<User> {
    const otpIsValid = verifyTOTP(otp, process.env.OTP_SECRET);
    if (!otpIsValid) {
      throw new RpcException(grpcErrorTypes.AUTH_OTP_INVALID);
    }
    user.isVerified = true;
    return await this.userRepository.save(user);
  }

  async generateAuthTokens(user: User): Promise<AccessAndRefreshTokens> {
    const accessTokenExpires = moment().add(process.env.JWT_ACCESS_EXPIRATION_MINUTES, 'minutes');
    const accessToken = this.generateToken(user, accessTokenExpires, tokenTypes.ACCESS, process.env.JWT_SECRET);

    const refreshTokenExpires = moment().add(process.env.JWT_REFRESH_EXPIRATION_DAYS, 'days');
    const refreshToken = this.generateToken(user, refreshTokenExpires, tokenTypes.REFRESH, process.env.JWT_SECRET);
    await this.saveToken(refreshToken, user, refreshTokenExpires, tokenTypes.REFRESH);

    return {
      access: {
        token: accessToken,
        expires: accessTokenExpires.toDate().toString(),
      },
      refresh: {
        token: refreshToken,
        expires: refreshTokenExpires.toDate().toString(),
      },
    };
  }

  async generateResetPasswordToken(email: string): Promise<{ resetPasswordToken: string; otp: string }> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new RpcException(grpcErrorTypes.USER_NOT_FOUND);
    }
    const otp = generateTOTP();
    const expires = moment().add(process.env.JWT_RESET_PASSWORD_EXPIRATION_MINUTES, 'minutes');
    const resetPasswordToken = this.generateToken(user, expires, tokenTypes.RESET_PASSWORD, process.env.JWT_SECRET);
    await this.saveToken(resetPasswordToken, user, expires, tokenTypes.RESET_PASSWORD);
    return { resetPasswordToken, otp: otp.otp };
  }

  async generateVerifyEmailToken(user: User): Promise<{ emailToken: string; otp: string }> {
    const otp = generateTOTP();
    const expires = moment().add(process.env.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES, 'minutes');
    const emailToken = this.generateToken(user, expires, tokenTypes.VERIFY_EMAIL, process.env.JWT_SECRET);
    await this.saveToken(emailToken, user, expires, tokenTypes.VERIFY_EMAIL);
    return { emailToken, otp: otp.otp };
  }

  async blacklistToken(user: User, token: string, blackListed: boolean): Promise<void> {
    await this.redisClient.set(`blacklist:${token}`, blackListed ? 'true' : 'false');
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const isBlacklisted = await this.redisClient.get(`blacklist:${token}`);
    return isBlacklisted === 'true';
  }
}
