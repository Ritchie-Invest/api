import { UseCase } from '../base/use-case';
import { GameModuleRepository } from '../domain/repository/game-module.repository';
import { ProgressionRepository } from '../domain/repository/progression.repository';
import { McqModule } from '../domain/model/McqModule';
import { Progression, ProgressionType } from '../domain/model/Progression';
import { QuestionNotFoundError } from '../domain/error/QuestionNotFoundError';
import { InvalidAnswerError } from '../domain/error/InvalidAnswerError';

export type CompleteQuestionCommand = {
  userId: string;
  questionId: string;
  answer: {
    selectedChoiceId: string;
  };
};

export type CompleteQuestionResult = {
  correctAnswer: boolean;
  feedback: string;
};

export class CompleteQuestionUseCase
  implements UseCase<CompleteQuestionCommand, CompleteQuestionResult>
{
  constructor(
    private readonly gameModuleRepository: GameModuleRepository,
    private readonly progressionRepository: ProgressionRepository,
  ) {}

  async execute(command: CompleteQuestionCommand): Promise<CompleteQuestionResult> {
    if (!command.answer?.selectedChoiceId?.trim()) {
      throw new InvalidAnswerError();
    }

    const gameModule = await this.gameModuleRepository.findById(command.questionId);
    if (!gameModule) {
      throw new QuestionNotFoundError(command.questionId);
    }

    if (!(gameModule instanceof McqModule)) {
      throw new InvalidAnswerError('Question type not supported');
    }

    const mcqModule = gameModule as McqModule;

    const selectedChoice = mcqModule.choices.find(
      (choice) => choice.id === command.answer.selectedChoiceId
    );

    if (!selectedChoice) {
      throw new InvalidAnswerError('Selected choice not found');
    }

    const isCorrect = selectedChoice.isCorrect;

    await this.saveProgression(command.userId, command.questionId, isCorrect);

    return {
      correctAnswer: isCorrect,
      feedback: selectedChoice.correctionMessage,
    };
  }

  private async saveProgression(
    userId: string,
    questionId: string,
    completed: boolean,
  ): Promise<void> {
    const existingProgression = await this.progressionRepository.findByUserIdAndEntryId(
      userId,
      questionId,
    );

    if (existingProgression) {
      existingProgression.completed = completed;
      existingProgression.updatedAt = new Date();
      await this.progressionRepository.update(existingProgression.id, existingProgression);
    } else {
      const progression = new Progression(
        crypto.randomUUID(),
        userId,
        questionId,
        ProgressionType.QUESTION,
        completed,
      );
      await this.progressionRepository.create(progression);
    }
  }
}
