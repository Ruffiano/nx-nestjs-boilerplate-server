import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenService } from './token/token.service';
import { User, Token } from '@nx-nestjs-boilerplate-server/sqlml';
import { UserRepository } from './auth.repository';
import { TokenRepository } from './token/token.repository';
import { gRpcAuthService } from '@nx-nestjs-boilerplate-server/proto-grpc';
@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('config.jwt.secret')
      }),
      inject: [ConfigService],
    }),
    ClientsModule.registerAsync([
      {
        name: 'AUTH_SERVICE_PACKAGE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: gRpcAuthService.AUTH_SERVICE_PACKAGE_NAME,
            protoPath: join(__dirname, 'proto-grpc/proto/schema/auth_schema.proto'),
            url: `${configService.get('config.grpc.authService.host')}:${configService.get('config.grpc.authService.port')}`,
          },
        }),
      },
      {
        name: 'NOTIFICATION_KAFKA_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              brokers: configService.get<[string]>('config.kafka.brokerCluster'),
              clientId: configService.get<string>('config.kafka.clientId'),
            },
            consumer: {
              groupId: configService.get<string>('config.kafka.groupId'),
            },
          },
        }),
      },
      {
        name: 'REDIS_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.REDIS,
          options: {
            host: configService.get<string>('config.redis.host'),
            port: configService.get<number>('config.redis.port'),
            password: configService.get<string>('config.redis.password'),
            db: configService.get<number>('config.redis.db'),
          },
        }),
      }
    ]),
    TypeOrmModule.forFeature([User, Token]),
  ],
  controllers: [AuthController],
  providers: [AuthService, TokenService, UserRepository, TokenRepository],
  exports: [AuthService, TokenService],
})
export class AuthModule {}
