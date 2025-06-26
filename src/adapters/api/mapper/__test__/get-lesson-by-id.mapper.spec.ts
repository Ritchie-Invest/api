import { GetLessonByIdMapper } from '../get-lesson-by-id.mapper';
import { ProfileRequest } from '../../request/profile.request';
import { UserType } from '../../../../core/domain/type/UserType';
import { Lesson } from '../../../../core/domain/model/Lesson';

describe('GetLessonByIdMapper', () => {
  describe('toDomain', () => {
    it('should map ProfileRequest and lessonId to GetLessonByIdCommand', () => {
      // Given
      const currentUser: ProfileRequest = {
        id: 'user-1',
        email: 'user1@example.com',
        type: UserType.ADMIN,
      };
      const lessonId = 'lesson-1';

      // When
      const command = GetLessonByIdMapper.toDomain(currentUser, lessonId);

      // Then
      expect(command).toEqual({
        currentUser: {
          id: 'user-1',
          type: UserType.ADMIN,
        },
        lessonId: 'lesson-1',
      });
    });
  });

  describe('fromDomain', () => {
    it('should map Lesson to GetLessonByIdResponse', () => {
      // Given
      const now = new Date();
      const lesson = new Lesson(
        'lesson-1',
        'Lesson Title',
        'Lesson Description',
        'chapter-1',
        1,
      );
      lesson.isPublished = true;
      lesson.createdAt = now;
      lesson.updatedAt = now;

      // When
      const response = GetLessonByIdMapper.fromDomain(lesson);

      // Then
      expect(response).toEqual({
        id: 'lesson-1',
        title: 'Lesson Title',
        description: 'Lesson Description',
        chapterId: 'chapter-1',
        order: 1,
        isPublished: true,
        createdAt: now,
        updatedAt: now,
      });
    });
  });
});
