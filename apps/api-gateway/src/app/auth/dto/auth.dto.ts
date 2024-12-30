import { IsEmail, IsString, IsOptional, IsNotEmpty, ValidateNested, IsBoolean, IsNumber, Validate, IsEnum, IsUUID, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { gRpcAuthService } from '@nx-nestjs-boilerplate-server/proto-grpc';
import { IsPasswordStrong, IsValidEmail } from '../validators/auth.validator';
import { IsValidPeriod } from '../validators/apikey.validator';

export class ResponseStatus implements gRpcAuthService.ResponseStatus {
  @ApiProperty()
  @IsNumber()
  code: number;

  @ApiProperty()
  @IsString()
  message: string;
}

export class UserAgent implements gRpcAuthService.UserAgent {
  country: string;
  region: string;
  timezone: string;
  city: string;
  ll: string; // latitude and longitude
  metro: number;
  area: number;
  os: string;
  browser?: string;
  deviceType: string;
  user_ip?: string;
}

export enum AuthType {
  EMAIL = 'email',
  GOOGLE = 'google',
}


export class RegisterRequest implements gRpcAuthService.RegisterRequest {
  @ApiProperty({ enum: AuthType, description: 'The authentication type' })
  @IsEnum(AuthType, { message: 'authType must be either "email" or "google"' })
  @IsString()
  authType: AuthType;

  @ApiProperty()
  @IsEmail()
  @Validate(IsValidEmail)
  email: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @Validate(IsPasswordStrong)
  password?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  username?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  token?: string; // Google OAuth token
}

export class LoginRequest implements gRpcAuthService.LoginRequest {
  @ApiProperty()
  @IsEmail()
  @Validate(IsValidEmail)
  email: string;

  @ApiProperty()
  @IsString()
  @Validate(IsPasswordStrong)
  @Type(() => String)
  password: string;

  // pass to gRPC
  useragent?: UserAgent;
}

export class LoginOAuthRequest implements gRpcAuthService.LoginOAuthRequest {
  
  @ApiProperty()
  @IsEmail()
  @Validate(IsValidEmail)
  email: string;

  @ApiProperty()
  @IsString()
  token: string;

  @ApiProperty()
  @IsString()
  authType: string;

  // pass to gRPC
  useragent?: UserAgent;
}

export class LogoutRequest implements gRpcAuthService.LogoutRequest {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}

export class RefreshTokensRequest implements gRpcAuthService.RefreshTokensRequest {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}

export class ForgotPasswordRequest implements gRpcAuthService.ForgotPasswordRequest {
  @ApiProperty()
  @IsEmail()
  @Validate(IsValidEmail)
  email: string;
}

export class ResetPasswordRequest implements gRpcAuthService.ResetPasswordRequest {
  token: string;
  
  @ApiProperty()
  @IsEmail()
  @Validate(IsValidEmail)
  email: string;

  @ApiProperty()
  @IsString()
  @Validate(IsPasswordStrong)
  @Type(() => String)
  newPassword: string;
}

export class SendVerificationEmailRequest implements gRpcAuthService.SendVerificationEmailRequest {
  // pass to gRPC
  token?: string;

  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  @Validate(IsValidEmail)
  email?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  password?: string;
}

export class ReSendVerificationEmailRequest implements gRpcAuthService.ReSendVerificationEmailRequest {
  @ApiProperty()
  @IsEmail()
  @Validate(IsValidEmail)
  email: string;

  @ApiProperty()
  @IsString()
  password: string;
}

export class VerifyEmailRequest implements gRpcAuthService.VerifyEmailRequest {
  @ApiProperty()
  @IsString()
  token: string;

  @ApiProperty()
  @IsString()
  otp: string;
}

export class VerifyEmailWithOtpRequest implements gRpcAuthService.VerifyEmailWithOtpRequest {
  @ApiProperty()
  @IsString()
  otp: string;

  // pass to gRPC
  token: string;
}

export class GetProfileRequest implements gRpcAuthService.GetProfileRequest {
  // pass to gRPC
  token: string;
}

export class UpdateProfileRequest implements gRpcAuthService.UpdateProfileRequest {
  // pass to gRPC
  token: string;

  @ApiProperty()
  @IsString()
  username: string;
}

export class DeleteAccountRequest implements gRpcAuthService.DeleteAccountRequest {
  // pass to gRPC
  token: string;
}

export class Token {
  @ApiProperty()
  @IsString()
  token: string;

  @ApiProperty()
  @IsString()
  expires: string;
}

export class TokenType implements gRpcAuthService.TokenType {
  @ApiProperty()
  @ValidateNested()
  @Type(() => Token)
  access: Token;

  @ApiProperty()
  @ValidateNested()
  @Type(() => Token)
  refresh: Token;
}

export class AuthResult implements gRpcAuthService.AuthResult {
  @ApiProperty()
  @IsString()
  authType: string;

  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiProperty()
  @IsEmail()
  @Validate(IsValidEmail)
  email: string;

  @ApiProperty()
  @IsString()
  username: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => TokenType)
  token: TokenType;
}

export class AuthResponse implements gRpcAuthService.AuthResponse {
  @ApiProperty()
  @ValidateNested()
  @Type(() => ResponseStatus)
  status: ResponseStatus;

  @ApiPropertyOptional()
  @ValidateNested()
  @Type(() => AuthResult)
  details: AuthResult;
}

export class ProfileResult implements gRpcAuthService.ProfileResult {
  @ApiProperty()
  @IsString()
  authType: string;

  @ApiProperty()
  @IsEmail()
  @Validate(IsValidEmail)
  email: string;

  @ApiProperty()
  @IsString()
  username: string;
}

export class ProfileResponse implements gRpcAuthService.ProfileResponse {
  @ApiProperty()
  @ValidateNested()
  @Type(() => ResponseStatus)
  status: ResponseStatus;

  @ApiPropertyOptional()
  @ValidateNested()
  @Type(() => ProfileResult)
  details?: ProfileResult;
}

export class StateResponse implements gRpcAuthService.StateResponse {
  @ApiProperty()
  @ValidateNested()
  @Type(() => ResponseStatus)
  status: ResponseStatus;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  details?: boolean;
}

export class BlockApiKeyResponse implements gRpcAuthService.StateResponse {
  @ApiProperty()
  @ValidateNested()
  @Type(() => ResponseStatus)
  status: ResponseStatus;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  details?: boolean;
}

