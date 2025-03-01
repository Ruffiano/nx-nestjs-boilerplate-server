// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v1.181.2
//   protoc               v5.27.1
// source: schema/auth_schema.proto

/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";

export const protobufPackage = "authService";

export interface RegisterRequest {
  authType: string;
  email: string;
  password?: string | undefined;
  username?:
    | string
    | undefined;
  /** google token */
  token?: string | undefined;
}

export interface UserAgent {
  country: string;
  region: string;
  timezone: string;
  city: string;
  /** latitude and longitude */
  ll: string;
  metro: number;
  area: number;
  os: string;
  browser?: string | undefined;
  deviceType: string;
  user_ip?: string | undefined;
}

export interface LoginRequest {
  email: string;
  password: string;
  useragent?: UserAgent | undefined;
}

export interface LoginOAuthRequest {
  email: string;
  authType: string;
  token: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface RefreshTokensRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}

export interface SendVerificationEmailRequest {
  token?: string | undefined;
  email?: string | undefined;
  password?: string | undefined;
}

export interface ReSendVerificationEmailRequest {
  email: string;
  password: string;
}

export interface VerifyEmailRequest {
  token: string;
  otp: string;
}

export interface VerifyEmailWithOtpRequest {
  otp: string;
  token: string;
}

export interface GetProfileRequest {
  token: string;
}

export interface UpdateProfileRequest {
  token: string;
  username: string;
}

export interface DeleteAccountRequest {
  token: string;
}

export interface Token {
  token: string;
  expires: string;
}

export interface TokenType {
  access: Token | undefined;
  refresh: Token | undefined;
}

export interface AuthResponse {
  status: ResponseStatus | undefined;
  details: AuthResult | undefined;
}

export interface AuthResult {
  authType: string;
  id: string;
  email: string;
  username: string;
  token: TokenType | undefined;
}

export interface ProfileResponse {
  status: ResponseStatus | undefined;
  profileResult?: ProfileResult | undefined;
}

export interface ProfileResult {
  authType: string;
  email: string;
  username: string;
}

export interface StateResponse {
  status: ResponseStatus | undefined;
  result?: boolean | undefined;
}

export interface ResponseStatus {
  code: number;
  message: string;
}

export const AUTH_SERVICE_PACKAGE_NAME = "authService";

export interface AuthServiceClient {
  register(request: RegisterRequest, ...rest: any): Observable<AuthResponse>;

  login(request: LoginRequest, ...rest: any): Observable<AuthResponse>;

  loginOAuth(request: LoginOAuthRequest, ...rest: any): Observable<AuthResponse>;

  logout(request: LogoutRequest, ...rest: any): Observable<StateResponse>;

  refreshTokens(request: RefreshTokensRequest, ...rest: any): Observable<AuthResponse>;

  forgotPassword(request: ForgotPasswordRequest, ...rest: any): Observable<StateResponse>;

  resetPassword(request: ResetPasswordRequest, ...rest: any): Observable<StateResponse>;

  sendVerificationEmail(request: SendVerificationEmailRequest, ...rest: any): Observable<StateResponse>;

  reSendVerificationEmail(request: ReSendVerificationEmailRequest, ...rest: any): Observable<AuthResponse>;

  verifyEmailWithToken(request: VerifyEmailRequest, ...rest: any): Observable<StateResponse>;

  verifyEmailWithOtp(request: VerifyEmailWithOtpRequest, ...rest: any): Observable<StateResponse>;

  getProfile(request: GetProfileRequest, ...rest: any): Observable<ProfileResponse>;

  updateProfile(request: UpdateProfileRequest, ...rest: any): Observable<ProfileResponse>;

  deleteAccount(request: DeleteAccountRequest, ...rest: any): Observable<StateResponse>;
}

export interface AuthServiceController {
  register(request: RegisterRequest, ...rest: any): Promise<AuthResponse> | Observable<AuthResponse> | AuthResponse;

  login(request: LoginRequest, ...rest: any): Promise<AuthResponse> | Observable<AuthResponse> | AuthResponse;

  loginOAuth(request: LoginOAuthRequest, ...rest: any): Promise<AuthResponse> | Observable<AuthResponse> | AuthResponse;

  logout(request: LogoutRequest, ...rest: any): Promise<StateResponse> | Observable<StateResponse> | StateResponse;

  refreshTokens(
    request: RefreshTokensRequest,
    ...rest: any
  ): Promise<AuthResponse> | Observable<AuthResponse> | AuthResponse;

  forgotPassword(
    request: ForgotPasswordRequest,
    ...rest: any
  ): Promise<StateResponse> | Observable<StateResponse> | StateResponse;

  resetPassword(
    request: ResetPasswordRequest,
    ...rest: any
  ): Promise<StateResponse> | Observable<StateResponse> | StateResponse;

  sendVerificationEmail(
    request: SendVerificationEmailRequest,
    ...rest: any
  ): Promise<StateResponse> | Observable<StateResponse> | StateResponse;

  reSendVerificationEmail(
    request: ReSendVerificationEmailRequest,
    ...rest: any
  ): Promise<AuthResponse> | Observable<AuthResponse> | AuthResponse;

  verifyEmailWithToken(
    request: VerifyEmailRequest,
    ...rest: any
  ): Promise<StateResponse> | Observable<StateResponse> | StateResponse;

  verifyEmailWithOtp(
    request: VerifyEmailWithOtpRequest,
    ...rest: any
  ): Promise<StateResponse> | Observable<StateResponse> | StateResponse;

  getProfile(
    request: GetProfileRequest,
    ...rest: any
  ): Promise<ProfileResponse> | Observable<ProfileResponse> | ProfileResponse;

  updateProfile(
    request: UpdateProfileRequest,
    ...rest: any
  ): Promise<ProfileResponse> | Observable<ProfileResponse> | ProfileResponse;

  deleteAccount(
    request: DeleteAccountRequest,
    ...rest: any
  ): Promise<StateResponse> | Observable<StateResponse> | StateResponse;
}

export function AuthServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = [
      "register",
      "login",
      "loginOAuth",
      "logout",
      "refreshTokens",
      "forgotPassword",
      "resetPassword",
      "sendVerificationEmail",
      "reSendVerificationEmail",
      "verifyEmailWithToken",
      "verifyEmailWithOtp",
      "getProfile",
      "updateProfile",
      "deleteAccount",
    ];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("AuthService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("AuthService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const AUTH_SERVICE_NAME = "AuthService";
