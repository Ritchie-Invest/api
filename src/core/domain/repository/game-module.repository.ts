import { GameModule } from '../model/GameModule';
import { Repository } from '../../base/repository';

export abstract class GameModuleRepository extends Repository<GameModule> {
  abstract findByLessonId(
    lessonId: string,
  ): Promise<GameModule[]> | GameModule[];
}
