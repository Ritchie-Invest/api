import { DomainError } from '../../base/domain-error';
import { GameType } from '../type/GameType';

export class GameModuleStrategyNotFoundError extends DomainError {
  constructor(gameType: GameType) {
    super(`Game module strategy not found for game type: ${gameType}`);
  }
}
