import { Repository } from '../../base/repository';
import { Chapter } from '../model/Chapter';

export type ProgressionData = {
  isCompleted: boolean;
  userId: string;
};

export type ModuleData = {
  id: string;
  Progression: ProgressionData[];
};

export type LessonData = {
  id: string;
  title: string;
  description: string;
  order: number;
  modules: ModuleData[];
};

export type ChapterData = {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: LessonData[];
};

export abstract class ChapterRepository extends Repository<Chapter> {
  abstract findAllWithLessonsDetails(userId: string): Promise<ChapterData[]>;
}
