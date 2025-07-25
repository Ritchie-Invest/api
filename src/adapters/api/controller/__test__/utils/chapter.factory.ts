import { Chapter } from '../../../../../core/domain/model/Chapter';

export class ChapterFactory {
  static make(overrides?: Partial<Chapter>): Chapter {
    return new Chapter(
      overrides?.id ?? crypto.randomUUID(),
      overrides?.title ?? 'Title of the chapter',
      overrides?.description ?? 'Description of the chapter',
      overrides?.order ?? 0,
      overrides?.isPublished ?? true,
    );
  }

  static makeInactive(overrides?: Partial<Chapter>): Chapter {
    return this.make({ ...overrides, isPublished: false });
  }
}
