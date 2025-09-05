import { GameModule } from './GameModule';
import { MatchChoice } from './MatchChoice';
import { MatchModuleInvalidDataError } from '../error/MatchModuleInvalidDataError';

export class MatchModule extends GameModule {
  instruction: string;
  matches: MatchChoice[];

  constructor(params: {
    id: string;
    lessonId: string;
    instruction: string;
    matches: MatchChoice[];
    updatedAt?: Date;
    createdAt?: Date;
  }) {
    super({ id: params.id, lessonId: params.lessonId });
    
    if (!params.instruction || params.instruction.trim().length === 0) {
      throw new MatchModuleInvalidDataError('Instruction is required');
    }
    
    if (!Array.isArray(params.matches) || params.matches.length < 2) {
      throw new MatchModuleInvalidDataError('At least two matches are required');
    }

    for (const match of params.matches) {
      if (!match.value1 || match.value1.trim().length === 0) {
        throw new MatchModuleInvalidDataError('Match value1 cannot be empty');
      }
      if (!match.value2 || match.value2.trim().length === 0) {
        throw new MatchModuleInvalidDataError('Match value2 cannot be empty');
      }
    }

    this.instruction = params.instruction;
    this.matches = params.matches;
    this.updatedAt = params.updatedAt || new Date();
    this.createdAt = params.createdAt || new Date();
  }
}
