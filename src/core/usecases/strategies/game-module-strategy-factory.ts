import { GameType } from '../../domain/type/GameType';
import { GameModuleStrategy } from './game-module-strategy';
import { GameModuleStrategyNotFoundError } from '../../domain/error/GameModuleStrategyNotFoundError';

export interface GameModuleStrategyFactory {
  getStrategy(type: GameType): GameModuleStrategy;
}

export class MapGameModuleStrategyFactory implements GameModuleStrategyFactory {
  private readonly strategies: Map<GameType, GameModuleStrategy>;

  constructor(strategies: { type: GameType; strategy: GameModuleStrategy }[]) {
    this.strategies = new Map(
      strategies.map(({ type, strategy }) => [type, strategy]),
    );
  }

  getStrategy(type: GameType): GameModuleStrategy {
    const strategy = this.strategies.get(type);
    if (!strategy) {
      throw new GameModuleStrategyNotFoundError(type);
    }
    return strategy;
  }
}
