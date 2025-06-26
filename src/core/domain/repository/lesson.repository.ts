import { Repository } from '../../base/repository';
import { Lesson } from '../model/Lesson';

export abstract class LessonRepository extends Repository<Lesson> {
  abstract findByChapter(chapterId: string): Promise<Lesson[]> | Lesson[];
}
