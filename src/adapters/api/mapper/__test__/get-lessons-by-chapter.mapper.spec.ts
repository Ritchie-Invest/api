import { getLessonsByChapterIdMapper } from '../get-lessons-by-chapter.mapper';
import { ProfileRequest } from '../../request/profile.request';
import { UserType } from '../../../../core/domain/type/UserType';
import { Lesson } from '../../../../core/domain/model/Lesson';
import { getLessonsByChapterIdResponse } from '../../response/get-lessons-by-chapter.response';

describe('getLessonsByChapterIdMapper', () => {
  describe('toDomain', () => {
    it('should map ProfileRequest and chapterId to getLessonsByChapterIdCommand', () => {
      // Given
      const currentUser: ProfileRequest = {
        id: 'user-1',
        email: 'user1@example.com',
        type: UserType.ADMIN,
      };
      const chapterId = 'chapter-1';

      // When
      const command = getLessonsByChapterIdMapper.toDomain(
        currentUser,
        chapterId,
      );

      // Then
      expect(command).toEqual({
        currentUser: {
          id: 'user-1',
          type: UserType.ADMIN,
        },
        chapterId: 'chapter-1',
      });
    });
  });

  describe('fromDomain', () => {
    it('should map Lesson[] to getLessonsByChapterIdResponse', () => {
      // Given
      const now = new Date();
      const lessons: Lesson[] = [
        new Lesson('lesson-1', 'Lesson 1', 'Desc 1', 'chapter-1',1, true, now, now),
        new Lesson('lesson-2', 'Lesson 2', 'Desc 2', 'chapter-1',2, false, now, now),
      ];

      // When
      const response = getLessonsByChapterIdMapper.fromDomain(lessons);

      // Then
      expect(response).toBeInstanceOf(getLessonsByChapterIdResponse);
      expect(response.lessons).toEqual([
        {
          id: 'lesson-1',
          title: 'Lesson 1',
          description: 'Desc 1',
          order: 1,
          isPublished: true,
          createdAt: now,
          updatedAt: now,
          chapterId: 'chapter-1',
        },
        {
          id: 'lesson-2',
          title: 'Lesson 2',
          description: 'Desc 2',
          order: 2,
          isPublished: false,
          createdAt: now,
          updatedAt: now,
          chapterId: 'chapter-1',
        },
      ]);
    });
  });
});
