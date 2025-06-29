import { DeleteChapterMapper } from '../delete-chapter.mapper';
import { ProfileRequest } from '../../request/profile.request';
import { UserType } from '../../../../core/domain/type/UserType';

describe('DeleteChapterMapper', () => {
  describe('toDomain', () => {
    it('should map ProfileRequest and chapterId to DeleteChapterCommand', () => {
      // Given
      const currentUser: ProfileRequest = {
        id: 'user-1',
        email: 'user1@example.com',
        type: UserType.ADMIN,
      };
      const chapterId = 'chapter-1';

      // When
      const command = DeleteChapterMapper.toDomain(currentUser, chapterId);

      // Then
      expect(command).toEqual({
        currentUser: {
          id: 'user-1',
          type: UserType.ADMIN,
        },
        chapterId: 'chapter-1',
      });
    });

    it('should handle STUDENT user type', () => {
      // Given
      const currentUser: ProfileRequest = {
        id: 'student-1',
        email: 'student@example.com',
        type: UserType.STUDENT,
      };
      const chapterId = 'chapter-2';

      // When
      const command = DeleteChapterMapper.toDomain(currentUser, chapterId);

      // Then
      expect(command).toEqual({
        currentUser: {
          id: 'student-1',
          type: UserType.STUDENT,
        },
        chapterId: 'chapter-2',
      });
    });
  });

  describe('fromDomain', () => {
    it('should create DeleteChapterResponse with chapterId', () => {
      // Given
      const chapterId = 'chapter-1';

      // When
      const response = DeleteChapterMapper.fromDomain(chapterId);

      // Then
      expect(response.message).toEqual(
        'Chapitre et leçons associées supprimés avec succès',
      );
      expect(response.deletedChapterId).toEqual('chapter-1');
      expect(response.deletedGamesCount).toEqual(0);
      expect(response.deletedAt).toBeInstanceOf(Date);
    });

    it('should create response with lessons count', () => {
      // Given
      const chapterId = 'chapter-2';
      const deletedLessonsCount = 3;

      // When
      const response = DeleteChapterMapper.fromDomain(
        chapterId,
        deletedLessonsCount,
      );

      // Then
      expect(response.message).toEqual(
        'Chapitre et leçons associées supprimés avec succès',
      );
      expect(response.deletedChapterId).toEqual('chapter-2');
      expect(response.deletedGamesCount).toEqual(3);
      expect(response.deletedAt).toBeInstanceOf(Date);
    });

    it('should create response with current timestamp', () => {
      // Given
      const chapterId = 'chapter-3';
      const beforeTime = new Date();

      // When
      const response = DeleteChapterMapper.fromDomain(chapterId);
      const afterTime = new Date();

      // Then
      expect(response.deletedAt.getTime()).toBeGreaterThanOrEqual(
        beforeTime.getTime(),
      );
      expect(response.deletedAt.getTime()).toBeLessThanOrEqual(
        afterTime.getTime(),
      );
    });
  });
});
