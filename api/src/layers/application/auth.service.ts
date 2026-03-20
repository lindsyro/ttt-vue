import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserService } from '../domain/services/user.service';
import { User } from '../domain/models/user.entity';
import { AccessTokenStrategy } from '../web/auth/strategies/access-token.strategy';
import { RefreshTokenStrategy } from '../web/auth/strategies/refresh-token.strategy';
import { JwtRequest } from '../web/dto/auth/jwt-request.dto';
import { JwtResponse } from '../web/dto/auth/jwt-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly accessTokenStrategy: AccessTokenStrategy,
    private readonly refreshTokenStrategy: RefreshTokenStrategy,
  ) {}

  /**
   * Регистрация: принимает DTO, хеширует пароль, создает доменную модель
   */
  async register(login: string, password: string): Promise<boolean> {
    if (!login?.trim() || !password?.trim()) {
      throw new BadRequestException('Логин и пароль не могут быть пустыми');
    }

    const existing = await this.userService.findByLogin(login);
    if (existing) {
      throw new BadRequestException('Игрок с таким логином уже существует');
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const newUser = User.create(login, hash);

    await this.userService.create(newUser);

    return true;
  }

  /**
   * Авторизация: принимает JwtRequest, возвращает JwtResponse
   */
  async authorize(dto: JwtRequest): Promise<JwtResponse> {
    const user = await this.userService.findByLogin(dto.login);

    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Неверный логин или пароль');
    }

    return this.generateTokens(user);
  }

  /**
   * Метод обновления токенов: принимает refreshToken, возвращает JwtResponse
   */
  async refreshTokens(refreshToken: string): Promise<JwtResponse> {
    try {
      // Получаем claims из токена
      const claims = this.refreshTokenStrategy.getClaims(refreshToken);
      const user = await this.userService.findByUuid(claims.sub);

      if (!user) {
        throw new UnauthorizedException('Пользователь не найден');
      }

      return this.generateTokens(user);
    } catch (e) {
      throw new UnauthorizedException('Сессия истекла, войдите снова');
    }
  }

  /**
   * Вспомогательный метод для генерации пары токенов
   */
  private generateTokens(user: User): JwtResponse {
    const accessToken = this.accessTokenStrategy.generateToken(user);
    const refreshToken = this.refreshTokenStrategy.generateToken(user);

    return new JwtResponse({
      accessToken,
      refreshToken,
    });
  }

  async getUserProfile(uuid: string): Promise<{ uuid: string; login: string }> {
    const user = await this.userService.findByUuid(uuid);
    if (!user) throw new UnauthorizedException();

    return {
      uuid: user.uuid,
      login: user.login,
    };
  }
}
