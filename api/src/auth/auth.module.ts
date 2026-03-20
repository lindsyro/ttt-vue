import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { AuthController } from 'src/layers/web/controllers/auth.controller';
import { AuthService } from 'src/layers/application/auth.service';
import { PassportModule } from '@nestjs/passport';
import { AccessTokenStrategy } from 'src/layers/web/auth/strategies/access-token.strategy';
import { RefreshTokenStrategy } from 'src/layers/web/auth/strategies/refresh-token.strategy';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [UsersModule, PassportModule, ConfigModule],
  providers: [AuthService, AccessTokenStrategy, RefreshTokenStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
