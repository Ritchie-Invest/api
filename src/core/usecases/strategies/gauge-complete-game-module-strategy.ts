import { GameModule } from '../../domain/model/GameModule';
import { GaugeModule } from '../../domain/model/GaugeModule';
import { CompleteGameModuleCommand } from '../complete-game-module.use-case';
import { CompleteGameModuleStrategy } from './complete-game-module-strategy';

export class GaugeCompleteGameModuleStrategy implements CompleteGameModuleStrategy {
  validate(
    gameModule: GameModule,
    command: CompleteGameModuleCommand,
  ): {
    isCorrect: boolean;
    feedback: string;
    correctChoiceId: string;
  } {
    if (!(gameModule instanceof GaugeModule)) {
      throw new Error('Game module must be a GaugeModule');
    }
    if (!command.gauge) {
      throw new Error('Gauge answer is required');
    }

    const targetValue = gameModule.value;
    const selectedValue = command.gauge.selectedValue;
    const tolerance = 15; 
    
    const isCorrect = Math.abs(selectedValue - targetValue) <= tolerance;
    
    const feedback = isCorrect 
      ? `Correct! You selected ${selectedValue}, which is very close to the target value of ${targetValue}.`
      : `Not quite right. You selected ${selectedValue}, but the target value was ${targetValue}.`;

    return {
      isCorrect,
      feedback,
      correctChoiceId: targetValue.toString(),
    };
  }
}
