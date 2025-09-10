import { Lesson } from '../../../../../core/domain/model/Lesson';

export class LessonFactory {
  static make(overrides?: Partial<Lesson>): Lesson {
    return new Lesson(
      overrides?.id ?? crypto.randomUUID(),
      overrides?.title ?? 'Title of the lesson',
      overrides?.description ?? 'Description of the lesson',
      overrides?.chapterId ?? crypto.randomUUID(),
      overrides?.order ?? 0,
      overrides?.isPublished ?? true,
    );
  }
}
