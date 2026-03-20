import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  UseGuards,
  Delete,
  ForbiddenException,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { GameWeb } from '../models/game.web';
import { GameWebMapper } from '../mappers/game.web.mapper';
import { UserIdPrincipal } from '../auth/decorators/userID.decorator';
import { MoveDto } from '../dto/game/move.dto';
import { GameService } from 'src/layers/application/game.service';
import { AccessTokenGuard } from '../auth/guards/access-token-guard';
import { LeaderboardEntity } from 'src/layers/domain/models/leaderboard.entity';
import { UserWebMapper } from '../mappers/user.web.mapper';
import { UserResponse } from '../dto/user/user.response';

@UseGuards(AccessTokenGuard)
@Controller('web')
export class WebController {
  constructor(
    private readonly gameService: GameService,
    private readonly mapper: GameWebMapper,
    private readonly usersMapper: UserWebMapper,
  ) {}

  /**
   * endpoint для создания новой игры с пользователем или компьютером
   */
  @Post('games')
  async createGame(
    @UserIdPrincipal() userId: string,
    @Body('mode') mode: 'AI' | 'PVP' = 'PVP',
  ): Promise<GameWeb> {
    const newGame = await this.gameService.createNewGame(userId, mode);
    return this.mapper.toWeb(newGame);
  }

  /**
   * endpoint для получения доступных текущих игр
   */
  @Get('games')
  async getAvailableGames(
    @UserIdPrincipal() userId: string,
  ): Promise<GameWeb[]> {
    const games = await this.gameService.getAvailableGames(userId);
    return games.map(game => this.mapper.toWeb(game));
  }

  /**
   * endpoint для получения всех юзеров
   */
  @Get('users')
  async getUsers(): Promise<UserResponse[]> {
    const users = await this.gameService.getUsers();
    return users.map(user => this.usersMapper.toWeb(user));
  }

  /**
   * endpoint для получения завершенных игр
   */
  @Get('games/completed')
  async getCompletedGames(
    @UserIdPrincipal() userId: string,
  ): Promise<GameWeb[]> {
    const games = await this.gameService.getCompletedGames(userId);
    return games.map(game => this.mapper.toWeb(game));
  }

  /**
   * endpoint для присоединения пользователя к игре
   */
  @Post('games/:uuid/join')
  async joinGame(
    @Param('uuid') uuid: string,
    @UserIdPrincipal() userId: string,
  ): Promise<GameWeb> {
    const joinedGame = await this.gameService.joinGame(uuid, userId);
    return this.mapper.toWeb(joinedGame);
  }

  /**
   * endpoint обновления текущей игры с учетом игры с пользователем или компьютером
   */
  @Post('games/:uuid')
  async updateGame(
    @Param('uuid') uuid: string,
    @Body() move: MoveDto,
    @UserIdPrincipal() userId: string,
  ): Promise<GameWeb> {
    const updatedGame = await this.gameService.handleGameUpdate(
      uuid,
      move.row,
      move.col,
      userId,
    );
    return this.mapper.toWeb(updatedGame);
  }

  /**
   * endpoint для получения первых N лучших игроков
   */
  @Get('users/leaderboard')
  async getLeaderboard(
    @Query('count', new ParseIntPipe({ optional: true })) count: number = 20,
  ): Promise<LeaderboardEntity[]> {
    return await this.gameService.getLeaderboard(count);
  }

  /**
   *  Очистка БД
   */
  @Delete('games')
  async deleteUsersGames(@UserIdPrincipal() userId: string) {
    return await this.gameService.deleteUsersGames(userId);
  }

  /**
   * endpoint для получения текущей игры
   */
  @Get('games/:uuid')
  async getGameById(
    @Param('uuid') uuid: string,
    @UserIdPrincipal() userId: string,
  ): Promise<GameWeb> {
    const gameDomain = await this.gameService.getGameById(uuid, userId);

    return this.mapper.toWeb(gameDomain);
  }

  /**
   * endpoint для получения информации о пользователе по UUID
   */
  @Get('users/:uuid')
  async getUserInfo(
    @Param('uuid') uuid: string,
    @UserIdPrincipal() userId: string,
  ) {
    if (uuid !== userId) {
      throw new ForbiddenException('У вас нет доступа к этой информации');
    }
    return await this.gameService.getUserInfo(uuid);
  }
}
