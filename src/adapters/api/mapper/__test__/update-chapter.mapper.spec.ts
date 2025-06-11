import { ProfileRequest } from '../../request/profile.request';
import { UserType } from '../../../../core/domain/type/UserType';
import { UpdateChapterMapper } from '../update-chapter.mapper';

describe('UpdateChapterMapper', () => {
  describe('fromDomain', () => {
    it('should map Chapter to UpdateChapterResponse', () => {
      // Given
      const chapter = {
        id: 'chapter-123',
        title: 'Updated Chapter Title',
        description: 'Updated Chapter Description',
        isPublished: false,
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-02T00:00:00Z'),
      };

      // When
      const response = UpdateChapterMapper.fromDomain(chapter);

      // Then
      expect(response).toEqual({
        id: 'chapter-123',
        title: 'Updated Chapter Title',
        description: 'Updated Chapter Description',
        isPublished: false,
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-02T00:00:00Z'),
      });
    });
  });

  describe('toDomain', () => {
    it('should map UpdateChapterRequest and ProfileRequest to UpdateChapterCommand', () => {
      // Given
      const currentUser: ProfileRequest = {
        id: 'user-1',
        email: 'user1@example.com',
        type: UserType.ADMIN,
      };
      const chapterId = 'chapter-123';
      const request = {
        id: 'chapter-123',
        title: 'Updated Chapter Title',
        description: 'Updated Chapter Description',
        isPublished: false,
      };

      // When
      const command = UpdateChapterMapper.toDomain(
        currentUser,
        chapterId,
        request,
      );

      // Then
      expect(command).toEqual({
        currentUser: {
          id: 'user-1',
          type: UserType.ADMIN,
        },
        chapterId: 'chapter-123',
        title: 'Updated Chapter Title',
        description: 'Updated Chapter Description',
        isPublished: false,
      });
    });
  });
});
