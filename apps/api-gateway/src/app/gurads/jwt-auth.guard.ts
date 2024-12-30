import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { HttpErrorTypes, HttpResponse} from '@nx-nestjs-boilerplate-server/http-handler';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import * as crypto from 'crypto';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private redisClient: Redis;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.redisClient = new Redis({
      host: this.configService.get<string>('config.redis.host'),
      port: this.configService.get<number>('config.redis.port'),
      password: this.configService.get<string>('config.redis.password'),
      db: this.configService.get<number>('config.redis.db'),
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    console.log(">> authHeader: ", authHeader);
    if (!authHeader) {
      throw HttpResponse.getFailureResponse(HttpErrorTypes.AUTH_TOKEN_NOT_FOUND);
    }

    const token = authHeader.split(' ')[1];
    console.log(">> token: ", token);
    if (!token) {
      throw HttpResponse.getFailureResponse(HttpErrorTypes.AUTH_TOKEN_NOT_FOUND);
    }

    const isBlacklisted = await this.redisClient.get(`blacklist:${token}`);
    if (isBlacklisted) {
      console.log(">> isBlacklisted: ", isBlacklisted);
      throw HttpResponse.getFailureResponse(HttpErrorTypes.AUTH_TOKEN_BLACKLISTED);
    }

    let payload: {
      type: string;
      sub: {
        user: {
          id: string;
          email?: string;
          wallet?: string;
          isVerified: boolean;
          isBlocked: boolean;
        };
        signature: string;
      },
      exp: number;
    };
    
    try {
      payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('config.jwt.secret'),
      });
    } catch (error) {
      throw HttpResponse.getFailureResponse(HttpErrorTypes.AUTH_TOKEN_EXPIRED);
    }
  
    if (payload.type !== ['access', 'refresh', 'resetPassword', 'verifyEmail'].find((type) => type === payload.type)) {
      throw HttpResponse.getFailureResponse(HttpErrorTypes.AUTH_TOKEN_INVALID);
    }

    if(!payload.sub.user.isVerified && payload.type === ['access', 'resetPassword'].find((type) => type === payload.type)) {
      console.log(">> user is verified", payload.sub.user.isVerified);
      throw HttpResponse.getFailureResponse(HttpErrorTypes.AUTH_USER_NOT_VERIFIED);
    }

    if (payload.sub.user.isBlocked) {
      console.log(">> user is blocked", payload.sub.user.isBlocked);
      throw HttpResponse.getFailureResponse(HttpErrorTypes.AUTH_TOKEN_BLACKLISTED);
    }

    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (payload.exp < currentTimestamp) {
      throw HttpResponse.getFailureResponse(HttpErrorTypes.AUTH_TOKEN_EXPIRED);
    }

    const signature = crypto.createHash('sha256').update(JSON.stringify({
      user: payload.sub.user,
      expires: payload.exp,
      signatureSecret: this.configService.get<string>('config.jwt.signatureSecret'),
    })).digest('hex');
    
    if (signature !== payload.sub.signature) {
      throw HttpResponse.getFailureResponse(HttpErrorTypes.AUTH_TOKEN_SIGNATURE_INVALID);
    }

    request.user = payload.sub.user;
    return true;
  }
}
