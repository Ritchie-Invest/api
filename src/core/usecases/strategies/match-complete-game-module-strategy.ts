import { MatchModule } from '../../domain/model/MatchModule';
import { CompleteGameModuleCommand } from '../complete-game-module.use-case';
import { CompleteGameModuleStrategy } from './complete-game-module-strategy';
import { InvalidAnswerError } from '../../domain/error/InvalidAnswerError';

export class MatchCompleteGameModuleStrategy
  implements CompleteGameModuleStrategy
{
  validate(
    matchModule: MatchModule,
    command: CompleteGameModuleCommand,
  ): {
    isCorrect: boolean;
    feedback: string;
    correctChoiceId: string;
  } {
    if (!command.match?.answers || command.match.answers.length === 0) {
      throw new InvalidAnswerError('Match answers are required');
    }

    let allCorrect = true;
    const incorrectMatches: string[] = [];

    for (const answer of command.match.answers) {
      const correctMatch = matchModule.matches.find(
        (match) => match.value1 === answer.value1
      );

      if (!correctMatch || correctMatch.value2 !== answer.value2) {
        allCorrect = false;
        incorrectMatches.push(`${answer.value1} -> ${answer.value2}`);
      }
    }

    if (command.match.answers.length !== matchModule.matches.length) {
      allCorrect = false;
    }

    const feedback = allCorrect 
      ? 'Toutes les correspondances sont correctes !' 
      : `Correspondances incorrectes: ${incorrectMatches.join(', ')}`;

    return {
      isCorrect: allCorrect,
      feedback,
      correctChoiceId: matchModule.id, 
    };
  }
}
