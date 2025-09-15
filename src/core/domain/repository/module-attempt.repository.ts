import { ModuleAttempt } from '../model/ModuleAttempt';

export interface ModuleAttemptRepository {
  create(attempt: ModuleAttempt): Promise<void> | void;

  findAllByLessonAttemptId(
    lessonAttemptId: string,
  ): Promise<ModuleAttempt[]> | ModuleAttempt[];

  findByLessonAttemptIdAndModuleId(
    lessonAttemptId: string,
    moduleId: string,
  ): Promise<ModuleAttempt | null> | ModuleAttempt | null;

  removeAll(): Promise<void> | void;
}
