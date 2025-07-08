import { Repository } from '../../base/repository';
import { Chapter } from '../model/Chapter';

export abstract class ChapterRepository extends Repository<Chapter> {
  abstract findAllWithLessonsDetails(userId: string): Promise<any[]>;
}
