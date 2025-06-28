import { UseCase } from '../base/use-case';
import { Game } from '../domain/model/Game';
import { GameRepository } from '../domain/repository/game.repository';
import { User } from '../domain/model/User';
import { UserType } from '../domain/type/UserType';
import { UserNotAllowedError } from '../domain/error/UserNotAllowedError';
import { GameNotFoundError } from '../domain/error/GameNotFoundError';
import { GameType } from '../domain/type/Game/GameType';
import { GameRules } from '../domain/type/Game/GameRules';
import { Question } from '../domain/type/Game/Question';

export type UpdateGameCommand = {
  currentUser: Pick<User, 'id' | 'type'>;
  gameId: string;
  type: GameType;
  rules: GameRules;
  questions: Question[];
  order?: number;
  isPublished: boolean;
};

export class UpdateGameUseCase implements UseCase<UpdateGameCommand, Game> {
  constructor(private readonly gameRepository: GameRepository) {}

  async execute(command: UpdateGameCommand): Promise<Game> {
    if (!this.canExecute(command.currentUser)) {
      throw new UserNotAllowedError(
        'Unauthorized: Only admins can update games',
      );
    }

    const { gameId, type, rules, questions, order, isPublished } = command;

    const currentGame = await this.gameRepository.findById(gameId);
    if (!currentGame) {
      throw new GameNotFoundError(gameId);
    }

    const updatedData: Partial<Game> = {
      type: type ?? currentGame.type,
      rules: rules ?? currentGame.rules,
      questions: questions ?? currentGame.questions,
      // lessonId is not modifiable - keep the existing one
      lessonId: currentGame.lessonId,
      order: order ?? currentGame.order,
      isPublished: isPublished ?? currentGame.isPublished,
      updatedAt: new Date(),
    };

    const updatedGame = await this.gameRepository.update(gameId, updatedData);
    if (!updatedGame) {
      throw new GameNotFoundError(gameId);
    }
    return updatedGame;
  }

  private canExecute(currentUser: Pick<User, 'id' | 'type'>): boolean {
    return currentUser.type === UserType.ADMIN;
  }
}
