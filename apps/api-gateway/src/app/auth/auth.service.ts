import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { gRpcAuthService } from '@nx-nestjs-boilerplate-server/proto-grpc';
import * as authDto from './dto/auth.dto';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import transformResponse from '../utils/grpc.utils';

@Injectable()
export class AuthService implements OnModuleInit {
  private authService: gRpcAuthService.AuthServiceClient;

  constructor(@Inject('AUTH_SERVICE_PACKAGE') private readonly clientGrpc: ClientGrpc) {}

  onModuleInit() {
    try {
      this.authService = this.clientGrpc.getService<gRpcAuthService.AuthServiceClient>(gRpcAuthService.AUTH_SERVICE_NAME);
    } catch (error) {
      console.error('AuthServiceClient not initialized:', error);
      
    }
  }

  register(data: authDto.RegisterRequest): Observable<gRpcAuthService.AuthResponse> {
    return this.authService.register(data).pipe(map(transformResponse));
  }

  login(data: authDto.LoginRequest): Observable<gRpcAuthService.AuthResponse> {
    return this.authService.login(data).pipe(map(transformResponse));
  }

  loginOAuth(data: authDto.LoginOAuthRequest): Observable<gRpcAuthService.AuthResponse> {
    return this.authService.loginOAuth(data).pipe(map(transformResponse));
  }

  logout(data: authDto.LogoutRequest): Observable<gRpcAuthService.StateResponse> {
    return this.authService.logout(data).pipe(map(transformResponse));
  }

  refreshTokens(data: authDto.RefreshTokensRequest): Observable<gRpcAuthService.AuthResponse> {
    return this.authService.refreshTokens(data).pipe(map(transformResponse));
  }

  forgotPassword(data: authDto.ForgotPasswordRequest): Observable<gRpcAuthService.StateResponse> {
    return this.authService.forgotPassword(data).pipe(map(transformResponse));
  }

  resetPassword(data: authDto.ResetPasswordRequest): Observable<gRpcAuthService.StateResponse> {
    return this.authService.resetPassword(data).pipe(map(transformResponse));
  }

  sendVerificationEmail(data: authDto.SendVerificationEmailRequest): Observable<gRpcAuthService.StateResponse> {
    return this.authService.sendVerificationEmail(data).pipe(map(transformResponse));
  }

  reSendVerificationEmail(data: authDto.ReSendVerificationEmailRequest): Observable<gRpcAuthService.AuthResponse> {
    return this.authService.reSendVerificationEmail(data).pipe(map(transformResponse));
  }

  verifyEmailWithToken(data: authDto.VerifyEmailRequest): Observable<gRpcAuthService.StateResponse> {
    return this.authService.verifyEmailWithToken(data).pipe(map(transformResponse));
  }

  verifyEmailWithOtp(data: authDto.VerifyEmailWithOtpRequest): Observable<gRpcAuthService.StateResponse> {
    return this.authService.verifyEmailWithOtp(data).pipe(map(transformResponse));
  }

  getProfile(data: authDto.GetProfileRequest): Observable<gRpcAuthService.ProfileResponse> {
    return this.authService.getProfile(data).pipe(map(transformResponse));
  }

  updateProfile(data: authDto.UpdateProfileRequest): Observable<gRpcAuthService.ProfileResponse> {
    return this.authService.updateProfile(data).pipe(map(transformResponse));
  }

  deleteAccount(data: authDto.DeleteAccountRequest): Observable<gRpcAuthService.StateResponse> {
    return this.authService.deleteAccount(data).pipe(map(transformResponse));
  }

}
