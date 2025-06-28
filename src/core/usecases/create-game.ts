import { GameRepository } from '../domain/repository/game.repository';
import { Game } from '../domain/model/Game';
import { UseCase } from '../base/use-case';
import { User } from '../domain/model/User';
import { UserType } from '../domain/type/UserType';
import { UserNotAllowedError } from '../domain/error/UserNotAllowedError';
import { GameType } from '../domain/type/Game/GameType';
import { GameRules } from '../domain/type/Game/GameRules';
import { Question } from '../domain/type/Game/Question';

export type CreateGameCommand = {
  currentUser: Pick<User, 'id' | 'type'>;
  type: GameType;
  rules: GameRules;
  questions: Question[];
  lessonId: string;
  order: number;
  isPublished?: boolean;
};

export class CreateGameUseCase implements UseCase<CreateGameCommand, Game> {
  constructor(private readonly gameRepository: GameRepository) {}

  async execute(command: CreateGameCommand): Promise<Game> {
    if (!this.canExecute(command.currentUser)) {
      throw new UserNotAllowedError(
        'Unauthorized: Only admins can create games',
      );
    }

    const { 
      type, 
      rules, 
      questions,
      lessonId, 
      order, 
      isPublished = false, 
      
    } = command;

    const game = new Game(
      this.generateId(),
      type, 
      rules, 
      questions,
      lessonId, 
      order, 
      isPublished
    );

    return this.gameRepository.create(game);
  }

  private canExecute(currentUser: Pick<User, 'id' | 'type'>): boolean {
    return currentUser.type === UserType.ADMIN;
  }

  private generateId(): string {
    return crypto.randomUUID();
  }
}