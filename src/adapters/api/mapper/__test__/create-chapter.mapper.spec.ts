import { CreateChapterMapper } from '../create-chapter.mapper';
import { ProfileRequest } from '../../request/profile.request';
import { CreateChapterRequest } from '../../request/create-chapter.request';
import { UserType } from '../../../../core/domain/type/UserType';

describe('CreateChapterMapper', () => {
  describe('fromDomain', () => {
    it('should map Chapter to CreateChapterResponse', () => {
      // Given
      const chapter = {
        id: 'chapter123',
        title: 'Chapter Title',
        description: 'Chapter Description',
        isPublished: true,
        order: 1,
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-02T00:00:00Z'),
      };

      // When
      const response = CreateChapterMapper.fromDomain(chapter);

      // Then
      expect(response).toEqual({
        id: 'chapter123',
        title: 'Chapter Title',
        description: 'Chapter Description',
        isPublished: true,
        order: 1,
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-02T00:00:00Z'),
      });
    });
  });

  describe('toDomain', () => {
    it('should map CreateChapterRequest and ProfileRequest to CreateChapterCommand', () => {
      // Given
      const currentUser: ProfileRequest = {
        id: 'user-1',
        email: 'user1@example.com',
        type: UserType.ADMIN,
      };
      const request: CreateChapterRequest = {
        title: 'New Chapter',
        description: 'Chapter Description',
      };

      // When
      const command = CreateChapterMapper.toDomain(currentUser, request);

      // Then
      expect(command).toEqual({
        currentUser: {
          id: 'user-1',
          type: UserType.ADMIN,
        },
        title: 'New Chapter',
        description: 'Chapter Description',
      });
    });
  });
});
