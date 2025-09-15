import { CreateLessonMapper } from '../create-lesson.mapper';
import { CreateLessonRequest } from '../../request/create-lesson.request';
import { ProfileRequest } from '../../request/profile.request';
import { Lesson } from '../../../../core/domain/model/Lesson';
import { UserType } from '../../../../core/domain/type/UserType';

describe('CreateLessonMapper', () => {
  describe('toDomain', () => {
    it('should map CreateLessonRequest and ProfileRequest to CreateLessonCommand', () => {
      // Given
      const currentUser: ProfileRequest = {
        id: 'user-1',
        email: 'user1@example.com',
        type: UserType.ADMIN,
      };
      const request: CreateLessonRequest = {
        title: 'Lesson Title',
        description: 'Lesson Description',
        chapterId: 'chapter-1',
      };

      // When
      const command = CreateLessonMapper.toDomain(currentUser, request);

      // Then
      expect(command).toEqual({
        currentUser: {
          id: 'user-1',
          type: 'ADMIN',
        },
        title: 'Lesson Title',
        description: 'Lesson Description',
        chapterId: 'chapter-1',
      });
    });
  });

  describe('fromDomain', () => {
    it('should map Lesson to CreateLessonResponse', () => {
      // Given
      const now = new Date();
      const lesson = new Lesson(
        'lesson-1',
        'Lesson Title',
        'Lesson Description',
        'chapter-1',
        1,
        false,
        [],
      );
      lesson.isPublished = true;
      lesson.createdAt = now;
      lesson.updatedAt = now;

      // When
      const response = CreateLessonMapper.fromDomain(lesson);

      // Then
      expect(response).toEqual({
        id: 'lesson-1',
        title: 'Lesson Title',
        description: 'Lesson Description',
        chapterId: 'chapter-1',
        order: 1,
        isPublished: true,
        modules: [],
        createdAt: now,
        updatedAt: now,
      });
    });
  });
});
