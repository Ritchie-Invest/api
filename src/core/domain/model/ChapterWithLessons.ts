import { LessonWithFirstGameModule } from './LessonWithFirstGameModule';
import { DomainModel } from '../../base/domain-model';

export class ChapterWithLessons extends DomainModel {
  public readonly title: string;
  public readonly description: string;
  public readonly order: number;
  public readonly lessons: LessonWithFirstGameModule[];

  constructor(params: {
    id: string;
    title: string;
    description: string;
    order: number;
    lessons: LessonWithFirstGameModule[];
  }) {
    super(params.id);
    this.title = params.title;
    this.description = params.description;
    this.order = params.order;
    this.lessons = params.lessons;
  }

  public isCompleted(): boolean {
    return this.lessons.every((lesson) => lesson.isCompleted);
  }

  public isInProgress(): boolean {
    return (
      this.lessons.some((lesson) => lesson.isCompleted) && !this.isCompleted()
    );
  }
}
