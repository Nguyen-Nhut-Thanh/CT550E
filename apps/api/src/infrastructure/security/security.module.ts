import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { getJwtOptions } from '../../config/jwt';
@Module({ imports: [JwtModule.register(getJwtOptions())], exports: [JwtModule] })
export class SecurityModule {
}
