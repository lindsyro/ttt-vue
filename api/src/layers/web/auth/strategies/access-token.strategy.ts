import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private configService: ConfigService) {
    const secret = configService.get<string>('JWT_ACCESS_SECRET');

    if (!secret) {
      throw new Error(
        'JWT_ACCESS_SECRET is not defined in environment variables',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  private get secret() {
    return this.configService.get<string>('JWT_ACCESS_SECRET')!;
  }

  // срабатывает при запросе к защищенному роуту
  async validate(payload: any) {
    if (!payload) {
      throw new UnauthorizedException();
    }

    return { uuid: payload.sub };
  }

  generateToken(user: { uuid: string }): string {
    const payload = {
      sub: user.uuid, // Сохраняем id в claims под стандартным ключом 'sub'
    };

    return jwt.sign(payload, this.secret, { expiresIn: '15m' });
  }

  getClaims(token: string): any {
    try {
      return jwt.verify(token, this.secret); // возвращает декодированный payload (claims), если подпись верна
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
