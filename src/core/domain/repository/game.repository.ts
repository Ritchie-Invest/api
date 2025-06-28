import { Repository } from '../../base/repository';
import { Game } from '../model/Game';

export abstract class GameRepository extends Repository<Game> {
  abstract findByLesson(lessonId: string): Promise<Game[]> | Game[];
}
