import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app/app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
    const logger = new Logger('AuthServiceLog');
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    // gRPC microservice options
    const grpcAuthMicroserviceOptions: MicroserviceOptions = {
        transport: Transport.GRPC,
        options: {
            package: 'authService',
            protoPath: join(__dirname, 'proto-grpc/proto/schema/auth_schema.proto'),
            url: `${configService.get('config.grpc.authService.host')}:${configService.get('config.grpc.authService.port')}`,
        },
    };

        // Kafka Microservice options
    const kafkaMicroserviceOptions: MicroserviceOptions = {
        transport: Transport.KAFKA,
        options: {
            client: {
                brokers: configService.get<[string]>('config.kafka.brokerCluster'),
            },
            consumer: {
                groupId: configService.get<string>('config.kafka.groupId'),
            },
        },
    };
    
    // Connect gRPC microservice
    app.connectMicroservice<MicroserviceOptions>(grpcAuthMicroserviceOptions);

    // Connect Kafka microservice
    app.connectMicroservice<MicroserviceOptions>(kafkaMicroserviceOptions);

    await app.startAllMicroservices().then(() => {
        logger.log(`gRPC server started on ${configService.get('config.grpc.authService.host')}:${configService.get('config.grpc.authService.port')}`);
    }).catch(err => {
        logger.error('Failed to start gRPC server', err);
    });
}

bootstrap();
