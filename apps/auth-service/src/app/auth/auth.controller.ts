import { Controller, Inject } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { gRpcAuthService } from '@nx-nestjs-boilerplate-server/proto-grpc';
import { AuthService } from './auth.service';
import * as authDto from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AuthService)
    private readonly authService: AuthService,
  ) {}

  @GrpcMethod(gRpcAuthService.AUTH_SERVICE_NAME, 'Register')
  async register(data: authDto.RegisterRequest): Promise<authDto.AuthResponse> {
    return this.authService.register(data);
  }

  @GrpcMethod(gRpcAuthService.AUTH_SERVICE_NAME, 'Login')
  async login(data: authDto.LoginRequest): Promise<authDto.AuthResponse> {
    return this.authService.login(data);
  }

  @GrpcMethod(gRpcAuthService.AUTH_SERVICE_NAME, 'LoginOAuth')
  async loginOAuth(data: authDto.LoginOAuthRequest): Promise<authDto.AuthResponse> {
    return this.authService.loginOAuth(data);
  }

  @GrpcMethod(gRpcAuthService.AUTH_SERVICE_NAME, 'Logout')
  async logout(data: authDto.LogoutRequest): Promise<authDto.StateResponse> {
    return this.authService.logout(data);
  }

  @GrpcMethod(gRpcAuthService.AUTH_SERVICE_NAME, 'RefreshTokens')
  async refreshTokens(data: authDto.RefreshTokensRequest): Promise<authDto.AuthResponse> {
    return this.authService.refreshTokens(data);
  }

  @GrpcMethod(gRpcAuthService.AUTH_SERVICE_NAME, 'ForgotPassword')
  async forgotPassword(data: authDto.ForgotPasswordRequest): Promise<authDto.StateResponse> {
    return this.authService.forgotPassword(data);
  }

  @GrpcMethod(gRpcAuthService.AUTH_SERVICE_NAME, 'ResetPassword')
  async resetPassword(data: authDto.ResetPasswordRequest): Promise<authDto.StateResponse> {
    console.log('>> 1 AuthController.resetPassword', data);
    return this.authService.resetPassword(data);
  }

  @GrpcMethod(gRpcAuthService.AUTH_SERVICE_NAME, 'SendVerificationEmail')
  async sendVerificationEmail(data: authDto.SendVerificationEmailRequest): Promise<authDto.StateResponse> {
    return this.authService.sendVerificationEmail(data);
  }

  @GrpcMethod(gRpcAuthService.AUTH_SERVICE_NAME, 'ReSendVerificationEmail')
  async reSendVerificationEmail(data: authDto.ReSendVerificationEmailRequest): Promise<authDto.AuthResponse> {
    return this.authService.reSendVerificationEmail(data);
  }

  @GrpcMethod(gRpcAuthService.AUTH_SERVICE_NAME, 'VerifyEmailWithToken')
  async verifyEmailWithToken(data: authDto.VerifyEmailRequest): Promise<authDto.StateResponse> {
    return this.authService.verifyEmailWithToken(data);
  }

  @GrpcMethod(gRpcAuthService.AUTH_SERVICE_NAME, 'VerifyEmailWithOtp')
  async verifyEmailWithOtp(data: authDto.VerifyEmailWithOtpRequest): Promise<authDto.StateResponse> {
    return this.authService.verifyEmailWithOtp(data);
  }

  @GrpcMethod(gRpcAuthService.AUTH_SERVICE_NAME, 'GetProfile')
  async getProfile(data: authDto.GetProfileRequest): Promise<authDto.ProfileResponse> {
    return this.authService.getProfile(data);
  }

  @GrpcMethod(gRpcAuthService.AUTH_SERVICE_NAME, 'UpdateProfile')
  async updateProfile(data: authDto.UpdateProfileRequest): Promise<authDto.ProfileResponse> {
    return this.authService.updateProfile(data);
  }

  @GrpcMethod(gRpcAuthService.AUTH_SERVICE_NAME, 'DeleteAccount')
  async deleteAccount(data: authDto.DeleteAccountRequest): Promise<authDto.StateResponse> {
    return this.authService.deleteAccount(data);
  }
}
