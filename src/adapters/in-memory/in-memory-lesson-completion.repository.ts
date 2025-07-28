import { Injectable } from '@nestjs/common';
import { LessonCompletionRepository } from '../../core/domain/repository/lesson-completion.repository';
import { LessonCompletion } from '../../core/domain/model/LessonCompletion';

@Injectable()
export class InMemoryLessonCompletionRepository
  implements LessonCompletionRepository
{
  private completions: Map<string, LessonCompletion> = new Map();

  create(lessonCompletion: LessonCompletion): void {
    this.completions.set(lessonCompletion.id, lessonCompletion);
  }

  findByUserIdAndLessonId(
    userId: string,
    lessonId: string,
  ): LessonCompletion | null {
    return (
      Array.from(this.completions.values()).find(
        (c) => c.userId === userId && c.lessonId === lessonId,
      ) || null
    );
  }

  removeAll(): void {
    this.completions.clear();
  }
}
