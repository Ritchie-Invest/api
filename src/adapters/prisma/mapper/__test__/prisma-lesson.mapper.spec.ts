import { Lesson as LessonEntity } from '@prisma/client';
import { Lesson } from '../../../../core/domain/model/Lesson';
import { PrismaLessonMapper } from '../prisma-lesson.mapper';

describe('PrismaLessonMapper', () => {
  const mapper = new PrismaLessonMapper();

  describe('fromDomain', () => {
    it('should map Lesson to LessonEntity', () => {
      // Given
      const lesson: Lesson = {
        id: 'lesson-1',
        title: 'Lesson 1',
        description: 'Description of Lesson 1',
        chapterId: 'chapter-1',
        order: 1,
        isPublished: true,
        updatedAt: new Date('2023-10-01T12:00:00Z'),
        createdAt: new Date('2023-10-01T12:00:00Z'),
      };

      // When
      const entity = mapper.fromDomain(lesson);

      // Then
      expect(entity).toEqual({
        id: 'lesson-1',
        title: 'Lesson 1',
        description: 'Description of Lesson 1',
        chapterId: 'chapter-1',
        order: 1,
        isPublished: true,
        updatedAt: new Date('2023-10-01T12:00:00Z'),
        createdAt: new Date('2023-10-01T12:00:00Z'),
      });
    });
  });

  describe('toDomain', () => {
    it('should map LessonEntity to Lesson', () => {
      // Given
      const entity: LessonEntity = {
        id: 'lesson-1',
        title: 'Lesson 1',
        description: 'Description of Lesson 1',
        chapterId: 'chapter-1',
        order: 1,
        isPublished: true,
        updatedAt: new Date('2023-10-01T12:00:00Z'),
        createdAt: new Date('2023-10-01T12:00:00Z'),
      };

      // When
      const lesson = mapper.toDomain(entity);

      // Then
      expect(lesson).toEqual({
        id: 'lesson-1',
        title: 'Lesson 1',
        description: 'Description of Lesson 1',
        chapterId: 'chapter-1',
        order: 1,
        isPublished: true,
        updatedAt: new Date('2023-10-01T12:00:00Z'),
        createdAt: new Date('2023-10-01T12:00:00Z'),
      });
    });
  });
});
