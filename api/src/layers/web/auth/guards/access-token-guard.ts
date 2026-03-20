import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AccessTokenGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      if (info?.name === 'TokenExpiredError') {
        throw new UnauthorizedException(
          'Срок действия токена истек. Пожалуйста, обновите его.',
        );
      }

      throw err || new UnauthorizedException('Токен невалиден');
    }
    return user;
  }
}
