import { Chapter as ChapterEntity } from '@prisma/client';
import { Chapter } from '../../../../core/domain/model/Chapter';
import { PrismaChapterMapper } from '../prisma-chapter.mapper';

describe('PrismaChapterMapper', () => {
  const mapper = new PrismaChapterMapper();

  describe('fromDomain', () => {
    it('should map Chapter to ChapterEntity', () => {
      // Given
      const chapter: Chapter = {
        id: 'chapter-1',
        title: 'Chapter One',
        description: 'This is the first chapter.',
        isPublished: true,
        updatedAt: new Date('2023-10-01T10:00:00Z'),
        createdAt: new Date('2023-10-01T11:00:00Z'),
      };

      // When
      const entity = mapper.fromDomain(chapter);

      // Then
      expect(entity).toEqual({
        id: 'chapter-1',
        title: 'Chapter One',
        description: 'This is the first chapter.',
        isPublished: true,
        updatedAt: new Date('2023-10-01T10:00:00Z'),
        createdAt: new Date('2023-10-01T11:00:00Z'),
      });
    });
  });

  describe('toDomain', () => {
    it('should map ChapterEntity to Chapter', () => {
      // Given
      const entity: ChapterEntity = {
        id: 'chapter-1',
        title: 'Chapter One',
        description: 'This is the first chapter.',
        isPublished: true,
        updatedAt: new Date('2023-10-01T10:00:00Z'),
        createdAt: new Date('2023-10-01T11:00:00Z'),
      };

      // When
      const chapter = mapper.toDomain(entity);

      // Then
      expect(chapter).toEqual({
        id: 'chapter-1',
        title: 'Chapter One',
        description: 'This is the first chapter.',
        isPublished: true,
        updatedAt: new Date('2023-10-01T10:00:00Z'),
        createdAt: new Date('2023-10-01T11:00:00Z'),
      });
    });
  });
});
