import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private configService: ConfigService) {
    const secret = configService.get<string>('JWT_REFRESH_SECRET');

    if (!secret) {
      throw new Error(
        'JWT_REFRESH_SECRET is not defined in environment variables',
      );
    }
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: any) => {
          return req?.body?.refreshToken;
        },
      ]),
      secretOrKey: secret,
      passReqToCallback: true,
    });
  }

  private get secret() {
    return this.configService.get<string>('JWT_REFRESH_SECRET')!;
  }

  async validate(req: Request, payload: any) {
    const refreshToken = req.body?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found in body');
    }

    return {
      uuid: payload.sub,
      refreshToken,
    };
  }

  generateToken(user: { uuid: string }): string {
    const payload = {
      sub: user.uuid,
    };

    return jwt.sign(payload, this.secret, { expiresIn: '7d' });
  }

  getClaims(token: string): any {
    try {
      return jwt.verify(token, this.secret);
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
