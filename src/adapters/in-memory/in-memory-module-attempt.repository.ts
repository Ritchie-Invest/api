import { Injectable } from '@nestjs/common';
import { ModuleAttemptRepository } from '../../core/domain/repository/module-attempt.repository';
import { ModuleAttempt } from '../../core/domain/model/ModuleAttempt';

@Injectable()
export class InMemoryModuleAttemptRepository
  implements ModuleAttemptRepository
{
  private attempts: Map<string, ModuleAttempt> = new Map();

  create(attempt: ModuleAttempt): void {
    this.attempts.set(attempt.id, attempt);
  }

  findAllByLessonAttemptId(lessonAttemptId: string): ModuleAttempt[] {
    return Array.from(this.attempts.values()).filter(
      (a) => a.lessonAttemptId === lessonAttemptId,
    );
  }

  findByLessonAttemptIdAndModuleId(
    lessonAttemptId: string,
    moduleId: string,
  ): ModuleAttempt | null {
    return (
      Array.from(this.attempts.values()).find(
        (a) =>
          a.lessonAttemptId === lessonAttemptId && a.gameModuleId === moduleId,
      ) || null
    );
  }

  removeAll(): void {
    this.attempts.clear();
  }
}
