import { ProfileRequest } from '../../request/profile.request';
import { UserType } from '../../../../core/domain/type/UserType';
import { GetChapterByIdMapper } from '../get-chapter-by-id.mapper';

describe('GetChapterByIdMapper', () => {
  describe('toDomain', () => {
    it('should map ProfileRequest and chapterId to GetChapterByIdCommand', () => {
      // Given
      const currentUser: ProfileRequest = {
        id: 'user-1',
        email: 'user1@example.com',
        type: UserType.ADMIN,
      };
      const chapterId = 'chapter-123';

      // When
      const command = GetChapterByIdMapper.toDomain(currentUser, chapterId);
      // Then
      expect(command).toEqual({
        currentUser: {
          id: 'user-1',
          type: UserType.ADMIN,
        },
        chapterId: 'chapter-123',
      });
    });

    describe('fromDomain', () => {
      it('should map Chapter to GetChapterByIdResponse', () => {
        // Given
        const chapter = {
          id: 'chapter-123',
          title: 'Chapter Title',
          description: 'Chapter Description',
          isPublished: true,
          createdAt: new Date('2023-01-01T00:00:00Z'),
          updatedAt: new Date('2023-01-02T00:00:00Z'),
        };

        // When
        const response = GetChapterByIdMapper.fromDomain(chapter);

        // Then
        expect(response).toEqual({
          id: 'chapter-123',
          title: 'Chapter Title',
          description: 'Chapter Description',
          isPublished: true,
          createdAt: new Date('2023-01-01T00:00:00Z'),
          updatedAt: new Date('2023-01-02T00:00:00Z'),
        });
      });
    });
  });
});
