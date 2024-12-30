import { ClientKafka, RpcException } from '@nestjs/microservices';
import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Redis from 'ioredis';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { OAuth2Client } from 'google-auth-library';
import { gRpcAuthService } from '@nx-nestjs-boilerplate-server/proto-grpc';
import { HttpErrorTypes as grpcErrorTypes, HttpResponse as grpcResponse} from '@nx-nestjs-boilerplate-server/http-handler';
import { User, Token } from '@nx-nestjs-boilerplate-server/sqlml';
import { TokenService } from './token/token.service';
import { tokenTypes } from './token/token.types';
import { AuthServiceInterface } from './auth.interface';
import { UserRepository } from './auth.repository';
import * as authDto from './dto/auth.dto';

@Injectable()
export class AuthService implements AuthServiceInterface {
  private googleClient: OAuth2Client;

  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    @Inject('NOTIFICATION_KAFKA_SERVICE') 
    private readonly kafkaClient: ClientKafka,
    @Inject('REDIS_SERVICE')
    private readonly redisClient: Redis,
  ) {
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    this.redisClient = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT, 10),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB_INDEX, 10),
    });
  }

  async register(data: gRpcAuthService.RegisterRequest): Promise<gRpcAuthService.AuthResponse> {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new RpcException(grpcErrorTypes.USER_ALREADY_EXISTS);
    }

    let user: User;
    if (data.authType === 'google') {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: data.token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload) throw new RpcException(grpcErrorTypes.USER_INVALID_CREDENTIALS);
      user = this.userRepository.create({
        email: payload.email,
        username: payload.name,
        password: data.token,
        authType: 'google',
        isVerified: true,
      });
    } else if (data.authType === 'email') {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      user = this.userRepository.create({
        email: data.email,
        username: data.username,
        password: hashedPassword,
        authType: data.authType,
        isVerified: false,
      });
    }

    await this.userRepository.save(user);
    const tokens = await this.tokenService.generateAuthTokens(user);

    this.kafkaClient.emit('notification', {
      type: 'EMAIL_SIGNUP',
      data: {
        email: user.email,
        subject: 'Registration Successful',
        message: 'You have successfully registered.',
      }
    });

    return grpcResponse.getSuccessResponse({
      authType: user.authType,
      id: user.id,
      email: user.email,
      username: user.username,
      token: tokens,
    });
  }

  async login(data: gRpcAuthService.LoginRequest): Promise<gRpcAuthService.AuthResponse> {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) throw new RpcException(grpcErrorTypes.USER_NOT_FOUND);
    
    const isUserVerified = await this.userRepository.isVerifiedUser(data.email);
    if (!isUserVerified) throw new RpcException(grpcErrorTypes.USER_NOT_VERIFIED);
    
    const isUserBlocked = await this.userRepository.isBlockedUser(data.email);
    if (isUserBlocked) throw new RpcException(grpcErrorTypes.USER_BLOCKED);

    const validPassword = await bcrypt.compare(data.password, user.password);
    if (!validPassword) throw new RpcException(grpcErrorTypes.USER_INVALID_CREDENTIALS);

    const tokens = await this.tokenService.generateAuthTokens(user);

    return grpcResponse.getSuccessResponse({
      authType: user.authType,
      id: user.id,
      email: user.email,
      username: user.username,
      token: tokens,
    });
  }

  async loginOAuth(data: gRpcAuthService.LoginOAuthRequest): Promise<gRpcAuthService.AuthResponse> {
    const ticket = await this.googleClient.verifyIdToken({
      idToken: data.token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload) throw new RpcException(grpcErrorTypes.AUTH_TOKEN_INVALID);

    let user = await this.userRepository.findByEmail(payload.email);
    if (!user) {
      user = this.userRepository.create({
        email: payload.email,
        username: payload.name,
        password: `none-password-${uuidv4()}`,
        authType: 'google',
        isVerified: true,
      });
      await this.userRepository.save(user);
    }

    const tokens = await this.tokenService.generateAuthTokens(user);

    return grpcResponse.getSuccessResponse({
      authType: user.authType,
      id: user.id,
      email: user.email,
      username: user.username,
      token: tokens,
    });
  }

  async logout(data: gRpcAuthService.LogoutRequest): Promise<gRpcAuthService.StateResponse> {
    const refreshToken = await this.tokenService.verifyToken(data.refreshToken, tokenTypes.REFRESH);
    if (!refreshToken) throw new RpcException(grpcErrorTypes.AUTH_TOKEN_NOT_FOUND);

    await this.tokenRepository.delete({ token: data.refreshToken, tokenType: tokenTypes.REFRESH });
    return grpcResponse.getSuccessResponse(null);
  }

  async refreshTokens(data: gRpcAuthService.RefreshTokensRequest): Promise<gRpcAuthService.AuthResponse> {
    const isBlacklisted = await this.redisClient.get(`blacklist:${data.refreshToken}`);
    if (isBlacklisted) throw new RpcException(grpcErrorTypes.USER_BLOCKED);

    const refreshToken = await this.tokenService.verifyToken(data.refreshToken, tokenTypes.REFRESH);
    if (!refreshToken) throw new RpcException(grpcErrorTypes.AUTH_TOKEN_INVALID);

    const user = await this.userRepository.findOne({ where: { id: refreshToken.userId } });
    if (!user) throw new RpcException(grpcErrorTypes.USER_NOT_FOUND);

    const tokens = await this.tokenService.generateAuthTokens(user);

    return grpcResponse.getSuccessResponse({
      authType: user.authType,
      id: user.id,
      email: user.email,
      username: user.username,
      token: tokens,
    });
  }

  async forgotPassword(data: gRpcAuthService.ForgotPasswordRequest): Promise<gRpcAuthService.StateResponse> {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) throw new RpcException(grpcErrorTypes.USER_NOT_FOUND);

    const { resetPasswordToken, otp } = await this.tokenService.generateResetPasswordToken(data.email);

    this.kafkaClient.emit('notification', {
      type: 'EMAIL_RESET_PASSWORD',
      data: {
        email: user.email,
        subject: 'Reset Password',
        otp,
        resetPasswordToken,
        message: `Your OTP is ${otp}. Reset your password using the following link: ${process.env.WEBSITE_URL}/reset-password?token=${resetPasswordToken}`,
      }
    });

    return grpcResponse.getSuccessResponse(null);
  }

  async resetPassword(data: gRpcAuthService.ResetPasswordRequest): Promise<gRpcAuthService.StateResponse> {
    const resetToken = await this.tokenService.verifyToken(data.token, tokenTypes.RESET_PASSWORD);
    console.log('>> resetToken: ', resetToken);
    if (!resetToken) throw new RpcException(grpcErrorTypes.AUTH_TOKEN_INVALID);

    const user = await this.userRepository.findOne({ where: { id: resetToken.userId } });
    console.log('>> user: ', user);
    if (!user) throw new RpcException(grpcErrorTypes.USER_NOT_FOUND);

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);
    user.password = hashedPassword;
    await this.userRepository.save(user);

    await this.tokenRepository.delete({ user: user, token: data.token, tokenType: tokenTypes.RESET_PASSWORD });

    this.kafkaClient.emit('notification', {
      type: 'EMAIL_PASSWORD_RESET_SUCCESS',
      data: {
        email: user.email,
        subject: 'Password Reset Successful',
        message: 'Your password has been successfully reset.',
      }
    });

    return grpcResponse.getSuccessResponse(null);
  }

  async sendVerificationEmail(data: gRpcAuthService.SendVerificationEmailRequest): Promise<gRpcAuthService.StateResponse> {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) throw new RpcException(grpcErrorTypes.USER_NOT_FOUND_BY_EMAIL);
    const { emailToken, otp } = await this.tokenService.generateVerifyEmailToken(user);

    this.kafkaClient.emit('notification', {
      type: 'EMAIL_VERIFY',
      data: {
        email: user.email,
        subject: 'Verify Your Email',
        otp,
        emailToken,
        message: `Your OTP is ${otp}. Verify your email using the following link: ${process.env.WEBSITE_URL}/verify-email?token=${emailToken}`,
      }
    });

    return grpcResponse.getSuccessResponse(null);
  }

  async reSendVerificationEmail(data: gRpcAuthService.ReSendVerificationEmailRequest): Promise<gRpcAuthService.AuthResponse> {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) throw new RpcException(grpcErrorTypes.USER_NOT_FOUND);

    const validPassword = await bcrypt.compare(data.password, user.password);
    if (!validPassword) throw new RpcException(grpcErrorTypes.USER_INVALID_CREDENTIALS);

    const tokens = await this.tokenService.generateAuthTokens(user);
    const { emailToken, otp } = await this.tokenService.generateVerifyEmailToken(user);

    this.kafkaClient.emit('notification', {
      type: 'EMAIL_VERIFY',
      data: {
        email: user.email,
        subject: 'Verify Your Email',
        otp,
        emailToken,
        message: `Your OTP is ${otp}. Verify your email using the following link: ${process.env.WEBSITE_URL}/verify-email?token=${emailToken}`,
      }
    });

    return grpcResponse.getSuccessResponse({
      authType: user.authType,
      id: user.id,
      email: user.email,
      username: user.username,
      token: tokens,
    });
  }

  async verifyEmailWithToken(data: gRpcAuthService.VerifyEmailRequest): Promise<gRpcAuthService.StateResponse> {
     const token = await this.tokenService.verifyToken(data.token, tokenTypes.VERIFY_EMAIL);
     if (!token) throw new RpcException(grpcErrorTypes.AUTH_TOKEN_INVALID);
 
     const user = await this.tokenService.verifyEmailWithToken(data.token, data.otp);
     if (!user) throw new RpcException(grpcErrorTypes.USER_INVALID_CREDENTIALS);
 
     this.kafkaClient.emit('notification', {
       type: 'EMAIL_VERIFIED_SUCCESS',
       data: {
         email: user.email,
         subject: 'Email Verified',
         message: 'Your email has been successfully verified.',
       }
     });
 
    return grpcResponse.getSuccessResponse(null);
  }

  async verifyEmailWithOtp(data: gRpcAuthService.VerifyEmailWithOtpRequest): Promise<gRpcAuthService.StateResponse> {
    const token = await this.tokenService.verifyToken(data.token, tokenTypes.REFRESH);
    if (!token) throw new RpcException(grpcErrorTypes.AUTH_TOKEN_INVALID);

    const user = await this.userRepository.findOne({ where: { id: token.userId } });
    if (!user) throw new RpcException(grpcErrorTypes.USER_NOT_FOUND);

    const isVerified = await this.tokenService.verifyEmailWithOtp(user, data.otp);
    if (!isVerified) throw new RpcException(grpcErrorTypes.USER_INVALID_CREDENTIALS);

    this.kafkaClient.emit('notification', {
      type: 'EMAIL_VERIFIED_SUCCESS',
      data: {
        email: user.email,
        subject: 'Email Verified',
        message: 'Your email has been successfully verified.',
      }
    });
    return grpcResponse.getSuccessResponse(null);
  }

  async getProfile(data: gRpcAuthService.GetProfileRequest): Promise<gRpcAuthService.ProfileResponse> {
    const token = await this.tokenService.verifyToken(data.token, tokenTypes.ACCESS);
    if (!token) throw new RpcException(grpcErrorTypes.AUTH_TOKEN_INVALID);

    const user = await this.userRepository.findOne({ where: { id: token.userId } });
    if (!user) throw new RpcException(grpcErrorTypes.USER_NOT_FOUND);

    return grpcResponse.getSuccessResponse({
      authType: user.authType,
      email: user.email,
      username: user.username,
    });
  }

  async updateProfile(data: gRpcAuthService.UpdateProfileRequest): Promise<gRpcAuthService.ProfileResponse> {
    const token = await this.tokenService.verifyToken(data.token, tokenTypes.ACCESS);
    if (!token) throw new RpcException(grpcErrorTypes.AUTH_TOKEN_INVALID);

    const user = await this.userRepository.findOne({ where: { id: token.id } });
    if (!user) throw new RpcException(grpcErrorTypes.USER_NOT_FOUND);

    if (data.username) user.username = data.username;
    const updatedUser = await this.userRepository.save(user);

    return grpcResponse.getSuccessResponse({
      authType: updatedUser.authType,
      email: updatedUser.email,
      username: updatedUser.username,
    });
  }

  async deleteAccount(data: gRpcAuthService.DeleteAccountRequest): Promise<gRpcAuthService.StateResponse> {
    const token = await this.tokenService.verifyToken(data.token, tokenTypes.ACCESS);
    if (!token) throw new RpcException(grpcErrorTypes.AUTH_TOKEN_INVALID);

    const user = await this.userRepository.findOne({ where: { id: token.userId } });
    if (!user) throw new RpcException(grpcErrorTypes.USER_NOT_FOUND);

    await this.userRepository.delete({ id: user.id });

    this.kafkaClient.emit('notification', {
      type: 'EMAIL_DELETE_ACCOUNT',
      data: {
        email: user.email,
        subject: 'Account Deleted',
        message: 'Your account has been successfully deleted.',
      }
    });

    return grpcResponse.getSuccessResponse(null);
  }
  
}
