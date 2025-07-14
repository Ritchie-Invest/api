import { GetUserChaptersMapper } from '../get-user-chapters.mapper';
import { ProfileRequest } from '../../request/profile.request';
import { UserType } from '../../../../core/domain/type/UserType';
import { ChapterSummary } from '../../../../core/domain/model/ChapterSummary';
import { LessonSummary } from '../../../../core/domain/model/LessonSummary';
import { Chapter } from '../../../../core/domain/model/Chapter';
import { Lesson } from '../../../../core/domain/model/Lesson';
import { GameType } from '../../../../core/domain/type/GameType';
import { GetUserChaptersResult } from '../../../../core/usecases/get-user-chapters.use-case';

describe('GetUserChaptersMapper', () => {
  describe('toDomain', () => {
    it('should map ProfileRequest to GetUserChaptersCommand', () => {
      // Given
      const profileRequest: ProfileRequest = {
        id: 'user-123',
        email: 'test@example.com',
        type: UserType.STUDENT,
      };

      // When
      const result = GetUserChaptersMapper.toDomain(profileRequest);

      // Then
      expect(result).toEqual({
        userId: 'user-123',
      });
    });
  });

  describe('fromDomain', () => {
    it('should map GetUserChaptersResult to GetUserChaptersResponse', () => {
      // Given
      const now = new Date('2023-01-01T00:00:00.000Z');

      const chapter = new Chapter(
        'chapter-1',
        'Chapter 1',
        'Description of Chapter 1',
        1,
        true,
        now,
        now,
      );

      const lesson = new Lesson(
        'lesson-1',
        'Lesson 1',
        'Description of Lesson 1',
        'chapter-1',
        1,
        true,
        GameType.MCQ,
        [],
        now,
        now,
      );

      const lessonSummary = new LessonSummary(lesson, true, 2, 3, 'module-123');

      const chapterSummary = new ChapterSummary(chapter, true, 1, 1, [
        lessonSummary,
      ]);

      const domainResult: GetUserChaptersResult = {
        chapters: [chapterSummary],
      };

      // When
      const result = GetUserChaptersMapper.fromDomain(domainResult);

      // Then
      expect(result).toEqual({
        chapters: [
          {
            id: 'chapter-1',
            title: 'Chapter 1',
            description: 'Description of Chapter 1',
            order: 1,
            isUnlocked: true,
            completedLessons: 1,
            totalLessons: 1,
            lessons: [
              {
                id: 'lesson-1',
                title: 'Lesson 1',
                description: 'Description of Lesson 1',
                order: 1,
                isUnlocked: true,
                completedModules: 2,
                totalModules: 3,
                gameModuleId: 'module-123',
              },
            ],
          },
        ],
      });
    });

    it('should handle lesson with null gameModuleId', () => {
      // Given
      const now = new Date('2023-01-01T00:00:00.000Z');

      const chapter = new Chapter(
        'chapter-1',
        'Chapter 1',
        'Description of Chapter 1',
        1,
        true,
        now,
        now,
      );

      const lesson = new Lesson(
        'lesson-1',
        'Lesson 1',
        'Description of Lesson 1',
        'chapter-1',
        1,
        true,
        GameType.MCQ,
        [],
        now,
        now,
      );

      const lessonSummary = new LessonSummary(lesson, true, 0, 0, null);

      const chapterSummary = new ChapterSummary(chapter, true, 0, 1, [
        lessonSummary,
      ]);

      const domainResult: GetUserChaptersResult = {
        chapters: [chapterSummary],
      };

      // When
      const result = GetUserChaptersMapper.fromDomain(domainResult);

      // Then
      expect(result.chapters[0]?.lessons[0]?.gameModuleId).toBeNull();
    });

    it('should handle multiple chapters and lessons', () => {
      // Given
      const now = new Date('2023-01-01T00:00:00.000Z');

      const chapter1 = new Chapter(
        'chapter-1',
        'Chapter 1',
        'Description of Chapter 1',
        1,
        true,
        now,
        now,
      );

      const chapter2 = new Chapter(
        'chapter-2',
        'Chapter 2',
        'Description of Chapter 2',
        2,
        false,
        now,
        now,
      );

      const lesson1 = new Lesson(
        'lesson-1',
        'Lesson 1',
        'Description of Lesson 1',
        'chapter-1',
        1,
        true,
        GameType.MCQ,
        [],
        now,
        now,
      );

      const lesson2 = new Lesson(
        'lesson-2',
        'Lesson 2',
        'Description of Lesson 2',
        'chapter-1',
        2,
        true,
        GameType.MCQ,
        [],
        now,
        now,
      );

      const lesson3 = new Lesson(
        'lesson-3',
        'Lesson 3',
        'Description of Lesson 3',
        'chapter-2',
        1,
        false,
        GameType.MCQ,
        [],
        now,
        now,
      );

      const lessonSummary1 = new LessonSummary(lesson1, true, 1, 1, 'module-1');

      const lessonSummary2 = new LessonSummary(lesson2, true, 0, 2, 'module-2');

      const lessonSummary3 = new LessonSummary(
        lesson3,
        false,
        0,
        1,
        'module-3',
      );

      const chapterSummary1 = new ChapterSummary(chapter1, true, 1, 2, [
        lessonSummary1,
        lessonSummary2,
      ]);

      const chapterSummary2 = new ChapterSummary(chapter2, false, 0, 1, [
        lessonSummary3,
      ]);

      const domainResult: GetUserChaptersResult = {
        chapters: [chapterSummary1, chapterSummary2],
      };

      // When
      const result = GetUserChaptersMapper.fromDomain(domainResult);

      // Then
      expect(result.chapters).toHaveLength(2);
      expect(result.chapters[0]?.lessons).toHaveLength(2);
      expect(result.chapters[1]?.lessons).toHaveLength(1);

      expect(result.chapters[0]?.lessons[0]?.gameModuleId).toBe('module-1');
      expect(result.chapters[0]?.lessons[1]?.gameModuleId).toBe('module-2');
      expect(result.chapters[1]?.lessons[0]?.gameModuleId).toBe('module-3');
    });

    it('should handle undefined lesson order', () => {
      // Given
      const now = new Date('2023-01-01T00:00:00.000Z');

      const chapter = new Chapter(
        'chapter-1',
        'Chapter 1',
        'Description of Chapter 1',
        1,
        true,
        now,
        now,
      );

      const lesson = new Lesson(
        'lesson-1',
        'Lesson 1',
        'Description of Lesson 1',
        'chapter-1',
        undefined, // order is undefined
        true,
        GameType.MCQ,
        [],
        now,
        now,
      );

      const lessonSummary = new LessonSummary(lesson, true, 1, 1, 'module-123');

      const chapterSummary = new ChapterSummary(chapter, true, 1, 1, [
        lessonSummary,
      ]);

      const domainResult: GetUserChaptersResult = {
        chapters: [chapterSummary],
      };

      // When
      const result = GetUserChaptersMapper.fromDomain(domainResult);

      // Then
      expect(result.chapters[0]?.lessons[0]?.order).toBe(0);
    });
  });
});
