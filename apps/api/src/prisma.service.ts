import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { prisma, PrismaClient } from 'database';

export interface PrismaService extends PrismaClient {}

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {

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
