import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { DomainModule } from '../domain/domain.module';
import { AuthService } from './auth.service';
import { GameService } from './game.service';
import { AccessTokenStrategy } from '../web/auth/strategies/access-token.strategy';
import { RefreshTokenStrategy } from '../web/auth/strategies/refresh-token.strategy';

@Module({
  imports: [DomainModule, DatabaseModule],
  providers: [
    GameService,
    AuthService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
  ],
  exports: [GameService, AuthService],
})
export class ApplicationModule {}
