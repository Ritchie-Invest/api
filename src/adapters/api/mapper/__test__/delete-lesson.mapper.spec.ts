import { DeleteLessonMapper } from '../delete-lesson.mapper';
import { ProfileRequest } from '../../request/profile.request';
import { UserType } from '../../../../core/domain/type/UserType';

describe('DeleteLessonMapper', () => {
  describe('toDomain', () => {
    it('should map ProfileRequest and lessonId to DeleteLessonCommand', () => {
      // Given
      const currentUser: ProfileRequest = {
        id: 'user-1',
        email: 'user1@example.com',
        type: UserType.ADMIN,
      };
      const lessonId = 'lesson-1';

      // When
      const command = DeleteLessonMapper.toDomain(currentUser, lessonId);

      // Then
      expect(command).toEqual({
        currentUser: {
          id: 'user-1',
          type: UserType.ADMIN,
        },
        lessonId: 'lesson-1',
      });
    });

    it('should handle STUDENT user type', () => {
      // Given
      const currentUser: ProfileRequest = {
        id: 'student-1',
        email: 'student@example.com',
        type: UserType.STUDENT,
      };
      const lessonId = 'lesson-2';

      // When
      const command = DeleteLessonMapper.toDomain(currentUser, lessonId);

      // Then
      expect(command).toEqual({
        currentUser: {
          id: 'student-1',
          type: UserType.STUDENT,
        },
        lessonId: 'lesson-2',
      });
    });
  });

  describe('fromDomain', () => {
    it('should create DeleteLessonResponse with lessonId and no deleted games', () => {
      // Given
      const lessonId = 'lesson-1';

      // When
      const response = DeleteLessonMapper.fromDomain(lessonId);

      // Then
      expect(response.message).toEqual('Leçon et jeux associés supprimés avec succès');
      expect(response.deletedLessonId).toEqual('lesson-1');
      expect(response.deletedGamesCount).toEqual(0);
      expect(response.deletedAt).toBeInstanceOf(Date);
    });

    it('should create DeleteLessonResponse with lessonId and deleted games count', () => {
      // Given
      const lessonId = 'lesson-2';
      const deletedGamesCount = 3;

      // When
      const response = DeleteLessonMapper.fromDomain(lessonId, deletedGamesCount);

      // Then
      expect(response.message).toEqual('Leçon et jeux associés supprimés avec succès');
      expect(response.deletedLessonId).toEqual('lesson-2');
      expect(response.deletedGamesCount).toEqual(3);
      expect(response.deletedAt).toBeInstanceOf(Date);
    });

    it('should create response with current timestamp', () => {
      // Given
      const lessonId = 'lesson-3';
      const beforeTime = new Date();

      // When
      const response = DeleteLessonMapper.fromDomain(lessonId, 1);
      const afterTime = new Date();

      // Then
      expect(response.deletedAt.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(response.deletedAt.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });

    it('should handle undefined deletedGamesCount', () => {
      // Given
      const lessonId = 'lesson-4';

      // When
      const response = DeleteLessonMapper.fromDomain(lessonId, undefined);

      // Then
      expect(response.deletedGamesCount).toEqual(0);
    });
  });
});
