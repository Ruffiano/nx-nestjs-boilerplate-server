import { gRpcAuthService } from '@nx-nestjs-boilerplate-server/proto-grpc';

export interface AuthServiceInterface {
  register(data: gRpcAuthService.RegisterRequest): Promise<gRpcAuthService.AuthResponse>;
  login(data: gRpcAuthService.LoginRequest): Promise<gRpcAuthService.AuthResponse>;
  loginOAuth(data: gRpcAuthService.LoginOAuthRequest): Promise<gRpcAuthService.AuthResponse>;
  logout(data: gRpcAuthService.LogoutRequest): Promise<gRpcAuthService.StateResponse>;
  refreshTokens(data: gRpcAuthService.RefreshTokensRequest): Promise<gRpcAuthService.AuthResponse>;
  forgotPassword(data: gRpcAuthService.ForgotPasswordRequest): Promise<gRpcAuthService.StateResponse>;
  resetPassword(data: gRpcAuthService.ResetPasswordRequest): Promise<gRpcAuthService.StateResponse>;
  sendVerificationEmail(data: gRpcAuthService.SendVerificationEmailRequest): Promise<gRpcAuthService.StateResponse>;
  reSendVerificationEmail(data: gRpcAuthService.ReSendVerificationEmailRequest): Promise<gRpcAuthService.AuthResponse>;
  verifyEmailWithToken(data: gRpcAuthService.VerifyEmailRequest): Promise<gRpcAuthService.StateResponse>;
  verifyEmailWithOtp(data: gRpcAuthService.VerifyEmailWithOtpRequest): Promise<gRpcAuthService.StateResponse>;
  getProfile(data: gRpcAuthService.GetProfileRequest): Promise<gRpcAuthService.ProfileResponse>;
  updateProfile(data: gRpcAuthService.UpdateProfileRequest): Promise<gRpcAuthService.ProfileResponse>;
  deleteAccount(data: gRpcAuthService.DeleteAccountRequest): Promise<gRpcAuthService.StateResponse>;
}
