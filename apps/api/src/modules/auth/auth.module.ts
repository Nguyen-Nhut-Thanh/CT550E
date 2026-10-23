import { Module } from '@nestjs/common';
import { MailModule } from '../../infrastructure/mail/mail.module';
import { SecurityModule } from '../../infrastructure/security/security.module';
import { CloudinaryModule } from '../../infrastructure/storage/cloudinary.module';
import { AuthAdminController } from './auth-admin.controller';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
@Module({ imports: [MailModule, SecurityModule, CloudinaryModule], providers: [AuthService, JwtStrategy], controllers: [AuthController, AuthAdminController], exports: [AuthService] })
export class AuthModule {
}
