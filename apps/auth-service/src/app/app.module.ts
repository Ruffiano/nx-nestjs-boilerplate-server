import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import configuration from '../config/config';
import {
  User,
  Token,
  Profile
} from '@nx-nestjs-boilerplate-server/sqlml';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true
    }),
    AuthModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('config.database.host'),
        port: configService.get('config.database.port'),
        username: configService.get('config.database.user'),
        password: configService.get('config.database.password'),
        database: configService.get('config.database.name'),
        entities: [User, Token, Profile],
        synchronize: true,
       ...(configService.get('config.database.host') !== 'localhost' &&{ ssl: {
          rejectUnauthorized: false
        }})
      })
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10
      }
    ])
  ]
})
export class AppModule {}
