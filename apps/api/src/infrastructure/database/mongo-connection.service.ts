import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { connectMongo, disconnectMongo } from 'database';
@Injectable()
export class MongoConnectionService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(MongoConnectionService.name);
    async onModuleInit() {
        this.logger.log('Đang kết nối MongoDB...');
        await connectMongo();
        this.logger.log('Kết nối MongoDB thành công.');
    }
    async onModuleDestroy() {
        await disconnectMongo();
    }
}
