import { GameType } from '../../domain/type/GameType';
import { CompleteGameModuleStrategy } from './complete-game-module-strategy';
import { GameModuleStrategyNotFoundError } from '../../domain/error/GameModuleStrategyNotFoundError';

export interface CompleteGameModuleStrategyFactory {
  getStrategy(type: GameType): CompleteGameModuleStrategy;
}

export class MapCompleteGameModuleStrategyFactory
  implements CompleteGameModuleStrategyFactory
{
  private readonly strategies: Map<GameType, CompleteGameModuleStrategy>;

  constructor(
    strategies: { type: GameType; strategy: CompleteGameModuleStrategy }[],
  ) {
    this.strategies = new Map(
      strategies.map(({ type, strategy }) => [type, strategy]),
    );
  }

  getStrategy(type: GameType): CompleteGameModuleStrategy {
    const strategy = this.strategies.get(type);
    if (!strategy) {
      throw new GameModuleStrategyNotFoundError(type);
    }
    return strategy;
  }
}
