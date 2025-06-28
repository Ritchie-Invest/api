import { UpdateLessonMapper } from '../update-lesson.mapper';
import { ProfileRequest } from '../../request/profile.request';
import { UserType } from '../../../../core/domain/type/UserType';
import { UpdateLessonRequest } from '../../request/update-lesson.request';
import { Lesson } from '../../../../core/domain/model/Lesson';

describe('UpdateLessonMapper', () => {
  describe('toDomain', () => {
    it('should map ProfileRequest, lessonId, and UpdateLessonRequest to UpdateLessonCommand', () => {
      // Given
      const currentUser: ProfileRequest = {
        id: 'user-1',
        email: 'user1@example.com',
        type: UserType.ADMIN,
      };
      const lessonId = 'lesson-1';
      const request: UpdateLessonRequest = {
        title: 'Updated Title',
        description: 'Updated Description',
        isPublished: true,
      };

      // When
      const command = UpdateLessonMapper.toDomain(
        currentUser,
        lessonId,
        request,
      );

      // Then
      expect(command).toEqual({
        currentUser: {
          id: 'user-1',
          type: UserType.ADMIN,
        },
        lessonId: 'lesson-1',
        title: 'Updated Title',
        description: 'Updated Description',
        isPublished: true,
      });
    });
  });

  describe('fromDomain', () => {
    it('should map Lesson to UpdateLessonResponse', () => {
      // Given
      const now = new Date();
      const lesson = new Lesson(
        'lesson-1',
        'Updated Title',
        'Updated Description',
        'chapter-1',
        2,
      );
      lesson.isPublished = true;
      lesson.createdAt = now;
      lesson.updatedAt = now;

      // When
      const response = UpdateLessonMapper.fromDomain(lesson);

      // Then
      expect(response).toEqual({
        id: 'lesson-1',
        chapterId: 'chapter-1',
        title: 'Updated Title',
        description: 'Updated Description',
        order: 2,
        isPublished: true,
        createdAt: now,
        updatedAt: now,
      });
    });
  });
});
