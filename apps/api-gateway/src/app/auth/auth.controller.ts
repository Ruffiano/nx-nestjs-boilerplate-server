import { Controller, Post, Body, Get, Put, Delete, Query, Req, UsePipes, ValidationPipe, UseGuards, Inject, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { AuthService } from './auth.service';
import * as authDto from './dto/auth.dto';
import { JwtAuthGuard } from '../gurads/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth/users')
export class AuthController {
  constructor(
    @Inject(AuthService)
    private readonly authService: AuthService,
    @Inject(REQUEST) private readonly request: Request
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiCreatedResponse({ status: 201, description: 'User registered successfully', type: authDto.AuthResponse })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async register(@Body() data: authDto.RegisterRequest) {
    return this.authService.register(data);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login a user' })
  @ApiCreatedResponse({ status: 200, description: 'User logged in successfully', type: authDto.AuthResponse })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async login(@Body() data: authDto.LoginRequest) {
    return this.authService.login(data);
  }

  @Post('login/oauth')
  @ApiOperation({ summary: 'Login a user with OAuth' })
  @ApiCreatedResponse({ status: 200, description: 'User logged in successfully', type: authDto.AuthResponse })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async loginOAuth(@Body() data: authDto.LoginOAuthRequest) {
    return this.authService.loginOAuth(data);
  }

  @Post('logout')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Logout a user' })
  @ApiCreatedResponse({ status: 200, description: 'User logged out successfully', type: authDto.StateResponse })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async logout(@Body() data: authDto.LogoutRequest) {
    return this.authService.logout(data);
  }

  @Post('refresh-tokens')
  @ApiOperation({ summary: 'Refresh authentication tokens' })
  @ApiCreatedResponse({ status: 200, description: 'Tokens refreshed successfully', type: authDto.AuthResponse })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async refreshTokens(@Body() data: authDto.RefreshTokensRequest) {
    return this.authService.refreshTokens(data);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Initiate password reset' })
  @ApiCreatedResponse({ status: 200, description: 'Password reset link sent', type: authDto.StateResponse })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async forgotPassword(@Body() data: authDto.ForgotPasswordRequest) {
    return this.authService.forgotPassword(data);
  }

  @Post('reset-password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reset user password' })
  @ApiCreatedResponse({ status: 200, description: 'Password reset successfully', type: authDto.StateResponse })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async resetPassword(@Body() data: authDto.ResetPasswordRequest) {
    data.token = this.request.headers.authorization.split(' ')[1];
    console.log('>> data:', data);
    return this.authService.resetPassword(data);
  }

  @Get('send-verification-email')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Send verification email' })
  @ApiCreatedResponse({ status: 200, description: 'Verification email sent', type: authDto.StateResponse })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async sendVerificationEmail(@Req() req) {
    const data: authDto.SendVerificationEmailRequest = { token: req.headers.authorization.split(' ')[1], email: this.request.user.email };
    console.log('>> data:', data);
    return this.authService.sendVerificationEmail(data);
  }

  @Post('re-send-verification-email')
  @ApiOperation({ summary: 'Re-send verification email' })
  @ApiCreatedResponse({ status: 200, description: 'Verification email resent', type: authDto.AuthResponse })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async reSendVerificationEmail(@Body() data: authDto.ReSendVerificationEmailRequest) {
    return this.authService.reSendVerificationEmail(data);
  }

  @Get('verify-email')
  @ApiOperation({ summary: 'Verify email with token' })
  @ApiCreatedResponse({ status: 200, description: 'Email verified successfully', type: authDto.StateResponse })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async verifyEmailWithToken(@Query() query: authDto.VerifyEmailRequest) {
    return this.authService.verifyEmailWithToken(query);
  }

  @Get('verify-email-with-otp')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Verify email with OTP' })
  @ApiCreatedResponse({ status: 200, description: 'Email verified successfully', type: authDto.StateResponse })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async verifyEmailWithOtp(@Query() query: authDto.VerifyEmailWithOtpRequest, @Req() req) {
    query.token = req.headers.authorization.split(' ')[1];
    return this.authService.verifyEmailWithOtp(query);
  }

  @Get('profile')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user profile' })
  @ApiCreatedResponse({ status: 200, description: 'User profile retrieved', type: authDto.ProfileResponse })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async getProfile(@Req() req) {
    const data: authDto.GetProfileRequest = { token: req.headers.authorization.split(' ')[1] };
    return this.authService.getProfile(data);
  }

  @Put('update-profile')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update user profile' })
  @ApiCreatedResponse({ status: 200, description: 'User profile updated', type: authDto.ProfileResponse })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateProfile(@Body() data: authDto.UpdateProfileRequest, @Req() req) {
    data.token = req.headers.authorization.split(' ')[1];
    return this.authService.updateProfile(data);
  }

  @Delete('delete-account')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete user account' })
  @ApiCreatedResponse({ status: 200, description: 'User account deleted', type: authDto.StateResponse })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async deleteAccount(@Req() req) {
    const data: authDto.DeleteAccountRequest = { token: req.headers.authorization.split(' ')[1] };
    return this.authService.deleteAccount(data);
  }
}
