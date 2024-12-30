import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../gurads/jwt-auth.guard';
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
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: gRpcAuthService.AUTH_SERVICE_PACKAGE_NAME,
            protoPath: join(__dirname, 'apps/proto-grpc/proto/schema/auth_schema.proto'),
            url: `${configService.get('config.grpc.authService.host')}:${configService.get('config.grpc.authService.port')}`,
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
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard],
  exports: [JwtAuthGuard],
})
export class AuthModule {}
