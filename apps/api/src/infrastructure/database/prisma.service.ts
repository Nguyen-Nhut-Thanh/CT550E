import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { prisma, PrismaClient } from 'database';
export interface PrismaService extends PrismaClient {
}
@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);
    constructor() {
        return new Proxy(this, {
            get(target, prop, receiver) {
                if (prop in target) {
                    return Reflect.get(target, prop, receiver);
                }
                const val = (prisma as any)[prop];
                if (typeof val === 'function') {
                    return val.bind(prisma);
                }
                return val;
            },
        });
    }
    async onModuleInit() {
        this.logger.log('Đang kết nối PostgreSQL...');
        await prisma.$connect();
        this.logger.log('Kết nối PostgreSQL thành công.');
    }
    async onModuleDestroy() {
        await prisma.$disconnect();
    }
}
