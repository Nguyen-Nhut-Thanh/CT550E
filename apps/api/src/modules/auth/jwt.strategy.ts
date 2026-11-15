import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { JwtPayload, JwtRequest } from 'shared';
import { getJwtSecret } from '../../config/jwt';
import { PrismaService } from '../../infrastructure/database/prisma.service';

function cookieExtractor(req: JwtRequest): string | null {
    return req?.cookies?.admin_token || null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    private readonly logger = new Logger(JwtStrategy.name);
    constructor(private readonly prisma: PrismaService) {
        const jwtSecret = getJwtSecret();
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                cookieExtractor,
                ExtractJwt.fromAuthHeaderAsBearerToken(),
            ]),
            ignoreExpiration: false,
            secretOrKey: jwtSecret,
        });
        if (!process.env.JWT_SECRET) {
            this.logger.warn('[AUTH] Warning: JWT_SECRET is not defined in .env, using fallback secret.');
        }
    }
    async validate(payload: JwtPayload) {
        if (!payload?.accountId) {
            throw new UnauthorizedException('Token không hợp lệ.');
        }
        const account = await this.prisma.accounts.findUnique({
            where: { account_id: payload.accountId },
            select: { status: true },
        });
        if (!account || account.status !== 1) {
            throw new UnauthorizedException('Tài khoản đã bị khóa hoặc không tồn tại.');
        }
        return {
            sub: payload.sub,
            email: payload.email,
            accountId: payload.accountId,
            isStaff: Boolean(payload.isStaff),
        };
    }
}
