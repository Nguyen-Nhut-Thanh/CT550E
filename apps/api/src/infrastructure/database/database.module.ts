import { Global, Module } from '@nestjs/common';
import { MongoConnectionService } from './mongo-connection.service';
import { PrismaService } from './prisma.service';
@Global()
@Module({ providers: [PrismaService, MongoConnectionService], exports: [PrismaService] })
export class DatabaseModule {
}
