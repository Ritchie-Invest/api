import { getUnitsByChapterIdMapper } from '../get-units-by-chapter.mapper';
import { ProfileRequest } from '../../request/profile.request';
import { UserType } from '../../../../core/domain/type/UserType';
import { Unit } from '../../../../core/domain/model/Unit';
import { getUnitsByChapterIdResponse } from '../../response/get-units-by-chapter.response';

describe('getUnitsByChapterIdMapper', () => {
  describe('toDomain', () => {
    it('should map ProfileRequest and chapterId to getUnitsByChapterIdCommand', () => {
      // Given
      const currentUser: ProfileRequest = {
        id: 'user-1',
        email: 'user1@example.com',
        type: UserType.ADMIN,
      };
      const chapterId = 'chapter-1';

      // When
      const command = getUnitsByChapterIdMapper.toDomain(
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
    it('should map Unit[] to getUnitsByChapterIdResponse', () => {
      // Given
      const now = new Date();
      const units = [
        Object.assign(new Unit('unit-1', 'Unit 1', 'Desc 1', 'chapter-1'), {
          isPublished: true,
          createdAt: now,
          updatedAt: now,
        }),
        Object.assign(new Unit('unit-2', 'Unit 2', 'Desc 2', 'chapter-1'), {
          isPublished: false,
          createdAt: now,
          updatedAt: now,
        }),
      ];

      // When
      const response = getUnitsByChapterIdMapper.fromDomain(units);

      // Then
      expect(response).toBeInstanceOf(getUnitsByChapterIdResponse);
      expect(response.units).toEqual([
        {
          id: 'unit-1',
          title: 'Unit 1',
          description: 'Desc 1',
          isPublished: true,
          createdAt: now,
          updatedAt: now,
          chapterId: 'chapter-1',
        },
        {
          id: 'unit-2',
          title: 'Unit 2',
          description: 'Desc 2',
          isPublished: false,
          createdAt: now,
          updatedAt: now,
          chapterId: 'chapter-1',
        },
      ]);
    });
  });
});
