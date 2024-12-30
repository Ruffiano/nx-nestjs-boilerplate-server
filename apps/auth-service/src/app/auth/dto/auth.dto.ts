import { gRpcAuthService } from '@nx-nestjs-boilerplate-server/proto-grpc';


export class RegisterRequest implements gRpcAuthService.RegisterRequest {
    authType: string;
    email: string;
    password?: string;
    username?: string;
    token?: string;
}

export class AuthResponse implements gRpcAuthService.AuthResponse {
    status: gRpcAuthService.ResponseStatus;
    details: gRpcAuthService.AuthResult;
}

export class LoginRequest implements gRpcAuthService.LoginRequest {
    email: string;
    password: string;
    useragent?: gRpcAuthService.UserAgent;
}


export class LoginOAuthRequest implements gRpcAuthService.LoginOAuthRequest {
    email: string;
    authType: string;
    token: string;
}


export class LogoutRequest implements gRpcAuthService.LogoutRequest {
    refreshToken: string;
}


export class StateResponse implements gRpcAuthService.StateResponse {
    status: gRpcAuthService.ResponseStatus;
    details?: boolean;
}


export class RefreshTokensRequest implements gRpcAuthService.RefreshTokensRequest {
    userId: string;
    refreshToken: string;
}

export class ForgotPasswordRequest implements gRpcAuthService.ForgotPasswordRequest {
    email: string;
}

export class ResetPasswordRequest implements gRpcAuthService.ResetPasswordRequest {
    email: string;
    token: string;
    newPassword: string;
}

export class SendVerificationEmailRequest implements gRpcAuthService.SendVerificationEmailRequest {
    email: string;
}

export class ReSendVerificationEmailRequest implements gRpcAuthService.ReSendVerificationEmailRequest {
    email: string;
    password: string;   
}

export class VerifyEmailRequest implements gRpcAuthService.VerifyEmailRequest {
    otp: string;
    token: string;
}


export class VerifyEmailWithOtpRequest implements gRpcAuthService.VerifyEmailWithOtpRequest {
    token: string;
    otp: string;
}

export class GetProfileRequest implements gRpcAuthService.GetProfileRequest {
    token: string;
}


export class ProfileResponse implements gRpcAuthService.ProfileResponse {
    status: gRpcAuthService.ResponseStatus;
    details?: gRpcAuthService.ProfileResult;
}


export class DeleteAccountRequest implements gRpcAuthService.DeleteAccountRequest {
    token: string;
}



export class UpdateProfileRequest implements gRpcAuthService.UpdateProfileRequest {
    token: string;
    username: string;
}