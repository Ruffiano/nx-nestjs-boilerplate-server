import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRepository } from './auth.repository';
import { TokenService } from './token/token.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Token } from '@nx-nestjs-boilerplate-server/sqlml';
import Redis from 'ioredis';
import { ClientKafka } from '@nestjs/microservices';
import { OAuth2Client } from 'google-auth-library';
import { HttpErrorTypes as grpcErrorTypes, HttpResponse as grpcResponse} from '@nx-nestjs-boilerplate-server/http-handler';
import { TokenRepository } from './token/token.repository';

jest.mock('ioredis');
jest.mock('google-auth-library');

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;
  let userRepository: UserRepository;
  let tokenRepository: TokenRepository;
  let tokenService: TokenService;
  let redisClient: Redis;
  let kafkaClient: ClientKafka;
  let googleClient: OAuth2Client;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        TokenService,
        JwtService,
        {
          provide: getRepositoryToken(UserRepository),
          useClass: jest.fn(() => ({
            findByEmail: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          })),
        },
        {
          provide: getRepositoryToken(Token),
          useValue: {},
        },
        {
          provide: TokenRepository,
          useValue: {
            findValidToken: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: 'NOTIFICATION_KAFKA_SERVICE',
          useClass: jest.fn(() => ({
            emit: jest.fn(),
          })),
        },
        {
          provide: 'REDIS_SERVICE',
          useClass: Redis,
        },
        {
          provide: OAuth2Client,
          useClass: jest.fn(() => ({
            verifyIdToken: jest.fn(),
          })),
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
    userRepository = module.get<UserRepository>(getRepositoryToken(UserRepository));
    tokenRepository = module.get<TokenRepository>(TokenRepository);
    tokenService = module.get<TokenService>(TokenService);
    redisClient = module.get<Redis>('REDIS_SERVICE');
    kafkaClient = module.get<ClientKafka>('NOTIFICATION_KAFKA_SERVICE');
    googleClient = module.get<OAuth2Client>(OAuth2Client);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // You can add similar tests as in auth.service.spec.ts for controller methods
});
