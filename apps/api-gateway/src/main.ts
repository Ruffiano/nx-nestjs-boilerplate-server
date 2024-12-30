import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionHandler } from '@nx-nestjs-boilerplate-server/http-handler';
import { setupSwagger } from './swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('ApiGatewayLog');
  const configService = app.get(ConfigService);
  const port = configService.get<number>('config.app.port');

  // Enable CORS with dynamic origin
  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = ['http://localhost:6000'];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Origin not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Access-Control-Allow-Headers',
      'Origin',
      'X-Requested-With',
      'x-api-key',
      'x-api-secret',
      'x-timestamp',
    ],
    credentials: true,
    optionsSuccessStatus: 200,
  });

  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new HttpExceptionHandler(httpAdapterHost));

  const globalPrefix = 'api/v1';
  app.setGlobalPrefix(globalPrefix);

  // Setup Swagger
  setupSwagger(app);

  await app
    .listen(port)
    .then(() => {
      console.log("ENV", process.env.NODE_ENV);
      logger.log(`API Gateway is running on http://localhost:${port}`);
    })
    .catch((err) => {
      logger.error('Failed to start API Gateway', err);
    });
}

bootstrap();

// Global error handler for uncaught exceptions and unhandled rejections
const unexpectedErrorHandler = (error: string) => {
  console.error('unexpectedErrorHandler: ', error);
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);
