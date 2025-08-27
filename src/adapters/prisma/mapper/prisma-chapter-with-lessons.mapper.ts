import { Injectable } from '@nestjs/common';
import { ChapterWithLessons } from '../../../core/domain/model/ChapterWithLessons';
import { LessonWithFirstGameModule } from '../../../core/domain/model/LessonWithFirstGameModule';

interface PrismaLessonWithRelations {
  id: string;
  title: string;
  description: string;
  order: number | null;
  modules: { id: string }[];
  lessonCompletion?: { id: string }[];
}

interface PrismaChapterWithRelations {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: PrismaLessonWithRelations[];
}

@Injectable()
export class PrismaChapterWithLessonsMapper {
  toDomain(chapter: PrismaChapterWithRelations): ChapterWithLessons {
    const lessons = (chapter.lessons || []).map((l) => this.mapLesson(l));
    return new ChapterWithLessons({
      id: chapter.id,
      title: chapter.title,
      description: chapter.description,
      order: chapter.order,
      lessons,
    });
  }

  private mapLesson(
    lesson: PrismaLessonWithRelations,
  ): LessonWithFirstGameModule {
    const firstModule = lesson.modules[0];
    return new LessonWithFirstGameModule({
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      order: lesson.order ?? 0,
      isCompleted: (lesson.lessonCompletion?.length || 0) > 0,
      gameModuleId: firstModule ? firstModule.id : null,
    });
  }
}
