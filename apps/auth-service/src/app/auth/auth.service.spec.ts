import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserRepository } from './auth.repository';
import { TokenService } from './token/token.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, Token } from '@nx-nestjs-boilerplate-server/sqlml';
import * as bcrypt from 'bcrypt';
import Redis from 'ioredis';
import { ClientKafka } from '@nestjs/microservices';
import { OAuth2Client, LoginTicket } from 'google-auth-library';
import { HttpErrorTypes as grpcErrorTypes, HttpResponse as grpcResponse } from '@nx-nestjs-boilerplate-server/http-handler';
import { TokenRepository } from './token/token.repository';
import { faker } from '@faker-js/faker';
import { gRpcAuthService } from '@nx-nestjs-boilerplate-server/proto-grpc';
import { tokenTypes } from './token/token.types';

// Mock the necessary modules
jest.mock('ioredis');
jest.mock('google-auth-library');
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: UserRepository;
  let tokenRepository: TokenRepository;
  let tokenService: TokenService;
  let redisClient: Redis;
  let kafkaClient: ClientKafka;
  let googleClient: OAuth2Client;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(UserRepository),
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Token),
          useValue: {},
        },
        {
          provide: TokenService,
          useValue: {
            generateAuthTokens: jest.fn(),
            verifyToken: jest.fn(),
            generateResetPasswordToken: jest.fn(),
            generateVerifyEmailToken: jest.fn(),
          },
        },
        JwtService,
        {
          provide: 'NOTIFICATION_KAFKA_SERVICE',
          useValue: {
            emit: jest.fn(),
          },
        },
        {
          provide: 'REDIS_SERVICE',
          useValue: new Redis(),
        },
        {
          provide: OAuth2Client,
          useValue: {
            verifyIdToken: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<UserRepository>(getRepositoryToken(UserRepository));
    tokenRepository = module.get<TokenRepository>(getRepositoryToken(Token));
    tokenService = module.get<TokenService>(TokenService);
    redisClient = module.get<Redis>('REDIS_SERVICE');
    kafkaClient = module.get<ClientKafka>('NOTIFICATION_KAFKA_SERVICE');
    googleClient = module.get<OAuth2Client>(OAuth2Client);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should throw an error if user already exists', async () => {
      const email = faker.internet.email();
      const registerData: gRpcAuthService.RegisterRequest = {
        email,
        password: faker.internet.password(),
        authType: 'email',
        token: '',
      };

      jest.spyOn(userRepository, 'findByEmail').mockResolvedValueOnce({} as User);
      try {
        await service.register(registerData);
      } catch (error) {
        expect(error.status.code).toBe(grpcErrorTypes.USER_ALREADY_EXISTS.code);
        expect(error.status.message).toBe(grpcErrorTypes.USER_ALREADY_EXISTS.message);
        expect(error.details).toBe('User already exists');
      }
    });

    it('should create a new user and return auth tokens', async () => {
      const email = faker.internet.email();
      const password = faker.internet.password();
      const hashedPassword = `hashed-${password}`;
      const registerData: gRpcAuthService.RegisterRequest = {
        email,
        password,
        authType: 'email',
        token: '',
      };

      jest.spyOn(userRepository, 'findByEmail').mockResolvedValueOnce(null);
      (bcrypt.hash as jest.Mock).mockResolvedValueOnce(hashedPassword);
      jest.spyOn(userRepository, 'create').mockReturnValue({
        id: faker.string.uuid(),
        email,
        password: hashedPassword,
        username: faker.internet.userName(),
        authType: 'email',
        isVerified: false,
      } as User);
      jest.spyOn(userRepository, 'save').mockResolvedValueOnce({} as User);
      jest.spyOn(tokenService, 'generateAuthTokens').mockResolvedValueOnce({
        access: { token: faker.string.uuid(), expires: faker.date.future().toISOString() },
        refresh: { token: faker.string.uuid(), expires: faker.date.future().toISOString() },
      });

      const result = await service.register(registerData);

      expect(result.status.code).toBe(2000);
      expect(result.status.message).toBe('SUCCESS');
      expect(result.details).toHaveProperty('authType', 'email');
      expect(result.details).toHaveProperty('email', email);
      expect(result.details).toHaveProperty('username');
      expect(result.details).toHaveProperty('token');
      expect(result.details.token).toHaveProperty('access');
      expect(result.details.token).toHaveProperty('refresh');
    });
  });

  describe('login', () => {
    it('should throw an error if user is not found', async () => {
      const email = faker.internet.email();
      const loginData: gRpcAuthService.LoginRequest = {
        email,
        password: faker.internet.password(),
      };

      jest.spyOn(userRepository, 'findByEmail').mockResolvedValueOnce(null);
      try {
        await service.login(loginData);
      } catch (error) {
        expect(error.status.code).toBe(grpcErrorTypes.USER_NOT_FOUND.code);
        expect(error.status.message).toBe(grpcErrorTypes.USER_NOT_FOUND.message);
        expect(error.details).toBe('User not found');
      }
    });

    it('should throw an error if password is invalid', async () => {
      const email = faker.internet.email();
      const password = faker.internet.password();
      const loginData: gRpcAuthService.LoginRequest = {
        email,
        password,
      };

      jest.spyOn(userRepository, 'findByEmail').mockResolvedValueOnce({ password: `hashed-${password}` } as User);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);
      try {
        await service.login(loginData);
      } catch (error) {
        expect(error.status.code).toBe(grpcErrorTypes.USER_INVALID_CREDENTIALS.code);
        expect(error.status.message).toBe(grpcErrorTypes.USER_INVALID_CREDENTIALS.message);
        expect(error.details).toBe('Invalid credentials');
      }
    });

    it('should return auth tokens for valid credentials', async () => {
      const email = faker.internet.email();
      const password = faker.internet.password();
      const hashedPassword = `hashed-${password}`;
      const loginData: gRpcAuthService.LoginRequest = {
        email,
        password,
      };

      const user: User = {
        id: faker.string.uuid(),
        email,
        password: hashedPassword,
        username: faker.internet.userName(),
        authType: 'email',
        isVerified: true,
        isBlocked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        profiles: [],
        tokens: [],
        useragent: undefined,
      };

      jest.spyOn(userRepository, 'findByEmail').mockResolvedValueOnce(user);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
      jest.spyOn(tokenService, 'generateAuthTokens').mockResolvedValueOnce({
        access: { token: faker.string.uuid(), expires: faker.date.future().toISOString() },
        refresh: { token: faker.string.uuid(), expires: faker.date.future().toISOString() },
      });

      const result = await service.login(loginData);

      expect(result.status.code).toBe(2000);
      expect(result.status.message).toBe('SUCCESS');
      expect(result.details).toHaveProperty('authType', 'email');
      expect(result.details.email).toBe(email);
      expect(result.details).toHaveProperty('username', user.username);
      expect(result.details).toHaveProperty('token');
      expect(result.details.token).toHaveProperty('access');
      expect(result.details.token).toHaveProperty('refresh');
    });
  });


  describe('logout', () => {
    it('should throw an error if refresh token is not valid', async () => {
      const logoutData: gRpcAuthService.LogoutRequest = {
        refreshToken: faker.string.uuid(),
      };

      jest.spyOn(tokenService, 'verifyToken').mockResolvedValueOnce(null);
      try {
        await service.logout(logoutData);
      } catch (error) {
        expect(error.status.code).toBe(grpcErrorTypes.AUTH_TOKEN_NOT_FOUND.code);
        expect(error.status.message).toBe(grpcErrorTypes.AUTH_TOKEN_NOT_FOUND.message);
        expect(error.details).toBeUndefined();
      }
    });
  });

});
