import { Injectable } from '@nestjs/common';
import { LessonAttemptRepository } from '../../core/domain/repository/lesson-attempt.repository';
import { LessonAttempt } from '../../core/domain/model/LessonAttempt';

@Injectable()
export class InMemoryLessonAttemptRepository
  implements LessonAttemptRepository
{
  private attempts: Map<string, LessonAttempt> = new Map();

  create(attempt: LessonAttempt): void {
    this.attempts.set(attempt.id, attempt);
  }

  findLastByUserIdAndLessonId(
    userId: string,
    lessonId: string,
  ): LessonAttempt | null {
    const filtered = Array.from(this.attempts.values()).filter(
      (a) => a.userId === userId && a.lessonId === lessonId,
    );
    if (filtered.length === 0) return null;
    return filtered[filtered.length - 1] || null;
  }

  finishAttempt(id: string, finishedAt: Date): void {
    const attempt = this.attempts.get(id);
    if (attempt) {
      attempt.finishedAt = finishedAt;
      this.attempts.set(id, attempt);
    }
  }

  removeAll(): void {
    this.attempts.clear();
  }
}
