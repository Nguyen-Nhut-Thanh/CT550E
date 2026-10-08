import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { prisma } from 'database';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  [key: string]: any;

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
    await prisma.$connect();
  }

  async onModuleDestroy() {
    await prisma.$disconnect();
  }
}
