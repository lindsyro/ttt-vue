import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Game } from '../domain/models/game.entity';
import { UserService } from '../domain/services/user.service';
import { GameRepository } from 'src/layers/database/repositories/game.repository';
import { GameAiService } from '../domain/services/game-ai.serviсe';
import { AI_USER } from '../domain/models/game-player.value-object';
import { GameStatus } from '../domain/types/game-state.types';
import { LeaderboardEntity } from '../domain/models/leaderboard.entity';

@Injectable()
export class GameService {
  constructor(
    private readonly gameRepository: GameRepository,
    private readonly userService: UserService,
    private readonly aiService: GameAiService,
  ) {}

  /**
   * Создание новой игры с пользователем или компьютером
   */
  async createNewGame(
    userId: string,
    mode: 'AI' | 'PVP' = 'AI',
  ): Promise<Game> {
    const user = await this.userService.findByUuid(userId);
    if (!user) throw new NotFoundException('Пользователь не найден');

    const newGame = Game.create(user);

    if (mode === 'AI') {
      const bot =
        (await this.userService.findByUuid(AI_USER.uuid)) ||
        (await this.userService.create(AI_USER));
      newGame.setOpponent(bot);
    }

    await this.gameRepository.saveGame(newGame);

    return newGame;
  }

  /**
   * Получение доступных пользователю текущих игр
   */
  async getAvailableGames(userId: string): Promise<Game[]> {
    return this.gameRepository.findAvailableGames(userId);
  }

  /**
   * Получение завершенных игр пользователя
   */
  async getCompletedGames(userId: string): Promise<Game[]> {
    return this.gameRepository.findCompletedGames(userId);
  }

  /**
   * Получение текущей игры
   */
  async getGameById(uuid: string, userId: string): Promise<Game> {
    const game = await this.gameRepository.findGameById(uuid);

    if (!game) {
      throw new NotFoundException('Игра не найдена');
    }

    const isCreator = game.creator.user.uuid === userId;
    const isOpponent = game.opponent?.user.uuid === userId;

    if (!isCreator && !isOpponent) {
      throw new ForbiddenException('У вас нет доступа к этой игре');
    }

    return game;
  }

  /**
   * Присоединение пользователя к игре
   */
  async joinGame(uuid: string, userId: string): Promise<Game> {
    const game = await this.gameRepository.findGameById(uuid);
    if (!game) throw new NotFoundException('Игра не найдена');

    if (game.state.status !== GameStatus.WAITING || game.opponent !== null)
      throw new BadRequestException('В этой игре уже есть два игрока');

    const user = await this.userService.findByUuid(userId);
    if (!user) throw new NotFoundException('Игрок не найден');
    if (game.creator.user.uuid === user.uuid)
      throw new BadRequestException('Вы являетесь создателем этой игры');

    game.setOpponent(user);
    const refreshedGame = await this.gameRepository.saveGame(game);

    return refreshedGame;
  }

  /**
   * Получение информации о пользователе
   */
  async getUserInfo(uuid: string) {
    const user = await this.userService.findByUuid(uuid);
    if (!user) throw new NotFoundException('Пользователь не найден');
    return { uuid: user.uuid, login: user.login };
  }

  async getUsers() {
    const users = await this.userService.findAll();

    return users.filter(user => user.uuid !== AI_USER.uuid);
  }

  /**
   * Очистка БД
   */
  async deleteUsersGames(userId: string): Promise<number> {
    return await this.gameRepository.deleteUsersGames(userId);
  }

  /**
   * Обработка хода
   */
  async handleGameUpdate(
    uuid: string,
    row: number,
    col: number,
    userId: string,
  ): Promise<Game> {
    const game = await this.getGameById(uuid, userId);

    if (game.state.status !== GameStatus.PLAYING)
      throw new BadRequestException('Игра завершена');
    if (game.state.playerUUID !== userId)
      throw new ForbiddenException('Не ваш ход');

    // 1. Ход игрока
    game.board.setMove(row, col, userId === game.creator.user.uuid ? 1 : 2);
    this.aiService.syncState(game);

    // 2. Ход AI
    const isBotNext =
      game.state.status === GameStatus.PLAYING &&
      game.opponent?.user.uuid === AI_USER.uuid;

    if (isBotNext) {
      const aiMove = this.aiService.getBestMove(game.board.field);
      if (aiMove) {
        game.board.setMove(aiMove.row, aiMove.col, 2);
        this.aiService.syncState(game);
      }
    } else if (game.state.status === GameStatus.PLAYING) {
      game.switchTurn();
    }

    return this.gameRepository.saveGame(game);
  }

  async getWinRate(userID: string): Promise<number> {
    const allGames = await this.gameRepository.findCompletedGames(userID);
    const gamesWithPeople = allGames.filter(
      g => g.opponent?.user.uuid !== AI_USER.uuid,
    );
    const total = gamesWithPeople.length;
    const wins = gamesWithPeople.filter(
      game =>
        game.state.status === GameStatus.WON &&
        game.state.playerUUID === userID,
    ).length;

    const winRate = total > 0 ? wins / total : 0;

    return +winRate.toFixed(4);
  }

  async getLeaderboard(count: number): Promise<LeaderboardEntity[]> {
    const users = await this.getUsers();
    const leaderboard = await Promise.all(
      users.map(async user => {
        const winRate = await this.getWinRate(user.uuid);
        return new LeaderboardEntity(user.uuid, winRate);
      }),
    );

    return leaderboard.sort((a, b) => b.winRate - a.winRate).slice(0, count);
  }
}
