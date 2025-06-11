import { ProfileRequest } from '../../request/profile.request';
import { UserType } from '../../../../core/domain/type/UserType';
import { GetChaptersMapper } from '../get-chapters.mapper';

describe('GetChaptersMapper', () => {
  describe('toDomain', () => {
    it('should map ProfileRequest to GetChaptersCommand', () => {
      // Given
      const currentUser: ProfileRequest = {
        id: 'user-1',
        email: 'user1@example.com',
        type: UserType.ADMIN,
      };

      // When
      const result = GetChaptersMapper.toDomain(currentUser);

      // Then
      expect(result).toEqual({
        currentUser: {
          id: 'user-1',
          type: UserType.ADMIN,
        },
      });
    });
  });

  describe('fromDomain', () => {
    it('should map Chapter array to GetChaptersResponse', () => {
      // Given
      const chapters = [
        {
          id: 'chapter1',
          title: 'Chapter 1',
          description: 'Description of Chapter 1',
          isPublished: true,
          createdAt: new Date('2023-01-01T00:00:00Z'),
          updatedAt: new Date('2023-01-02T00:00:00Z'),
        },
        {
          id: 'chapter2',
          title: 'Chapter 2',
          description: 'Description of Chapter 2',
          isPublished: false,
          createdAt: new Date('2023-01-03T00:00:00Z'),
          updatedAt: new Date('2023-01-04T00:00:00Z'),
        },
      ];

      // When
      const result = GetChaptersMapper.fromDomain(chapters);

      // Then
      expect(result).toEqual({
        chapters: [
          {
            id: 'chapter1',
            title: 'Chapter 1',
            description: 'Description of Chapter 1',
            isPublished: true,
            createdAt: new Date('2023-01-01T00:00:00Z'),
            updatedAt: new Date('2023-01-02T00:00:00Z'),
          },
          {
            id: 'chapter2',
            title: 'Chapter 2',
            description: 'Description of Chapter 2',
            isPublished: false,
            createdAt: new Date('2023-01-03T00:00:00Z'),
            updatedAt: new Date('2023-01-04T00:00:00Z'),
          },
        ],
      });
    });
  });
});
