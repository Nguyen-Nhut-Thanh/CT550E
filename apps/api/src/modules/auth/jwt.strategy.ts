import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import type { JwtPayload } from 'shared';

type JwtRequest = Request & {
  cookies?: Record<string, string | undefined>;
};

function cookieExtractor(req: JwtRequest): string | null {
  return req?.cookies?.admin_token || null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor() {
    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });

    if (!process.env.JWT_SECRET) {
      this.logger.warn(
        '[AUTH] Warning: JWT_SECRET is not defined in .env, using fallback secret.',
      );
    }
  }

  async validate(payload: JwtPayload) {
    return {
      sub: payload.sub,
      email: payload.email,
      accountId: payload.accountId,
      isStaff: payload.isStaff,
    };
  }
}
