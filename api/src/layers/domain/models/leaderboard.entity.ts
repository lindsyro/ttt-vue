/**
 * Модель статистики пользователя для лидерборда
 */
export class LeaderboardEntity {
  /**
   * Уникальный идентификатор пользователя
   */
  public readonly userUUID: string;

  /**
   * Соотношение побед (Win Rate)
   */
  public readonly winRate: number;

  constructor(userUUID: string, winRate: number) {
    this.userUUID = userUUID;
    this.winRate = winRate;
  }
}
