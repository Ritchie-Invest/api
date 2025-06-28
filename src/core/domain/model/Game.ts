import { DomainModel } from '../../base/domain-model';
import { GameInvalidDataError } from '../error/GameInvalidDataError';
import { GameRules } from '../type/Game/GameRules';
import { GameType } from '../type/Game/GameType';
import { Question } from '../type/Game/Question';


export class Game extends DomainModel {
  type: GameType;
  rules: GameRules;
  questions: Question[];  
  lessonId: string;
  order?: number ;
  isPublished: boolean;
  updatedAt: Date;
  createdAt: Date;

  constructor(
    id: string,
    type: GameType,
    rules: GameRules,
    questions: Question[],
    lessonId: string,
    order?: number, 
    isPublished: boolean = false,
    updatedAt?: Date,
    createdAt?: Date,
  ) {
    super(id);


    if (!type) {
      throw new GameInvalidDataError('Game type is required');
    }
    if (!rules) {
      throw new GameInvalidDataError('Game rules are required');
    }
    if (!questions || questions.length === 0) {
      throw new GameInvalidDataError('At least one question is required');
    }
    if (!questions.every(q => q)) {
      throw new GameInvalidDataError('All questions must be valid');
    }
    
    if (!lessonId) {
      throw new GameInvalidDataError('Lesson ID is required');
    }


    this.type = type;
    this.rules = rules;
    this.questions = questions;
    this.lessonId = lessonId;
    this.order = order;
    this.isPublished = isPublished;
    this.updatedAt = updatedAt || new Date();
    this.createdAt = createdAt || new Date();
  }
}
