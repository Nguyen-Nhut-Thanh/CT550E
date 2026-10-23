import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { disconnectMongo, prisma } from 'database';
import { AppModule } from './app.module';
export async function bootstrap(): Promise<void> {
    const logger = new Logger('Startup');
    let app: INestApplication | undefined;
    try {
        app = await NestFactory.create(AppModule);
        app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
        app.enableCors({ origin: ['http://localhost:3000'], credentials: true });
        app.enableShutdownHooks();
        // Nest initializes database providers before it starts accepting requests.
        await app.listen(Number(process.env.API_PORT ?? 4000));
    }
    catch (error) {
        logger.error('Không thể khởi động API', error);
        if (app)
            await app.close().catch(closeError => logger.error('Không thể đóng API', closeError));
        // Also release clients if application creation failed before hooks were registered.
        await Promise.allSettled([prisma.$disconnect(), disconnectMongo()]);
        process.exitCode = 1;
    }
}
