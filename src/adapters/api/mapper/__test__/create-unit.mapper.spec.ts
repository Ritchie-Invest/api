import { CreateUnitMapper } from '../create-unit.mapper';
import { CreateUnitRequest } from '../../request/create-unit.request';
import { ProfileRequest } from '../../request/profile.request';
import { Unit } from '../../../../core/domain/model/Unit';
import { UserType } from '../../../../core/domain/type/UserType';

describe('CreateUnitMapper', () => {
  describe('toDomain', () => {
    it('should map CreateUnitRequest and ProfileRequest to CreateUnitCommand', () => {
      // Given
      const currentUser: ProfileRequest = {
        id: 'user-1',
        email: 'user1@example.com',
        type: UserType.ADMIN,
      };
      const request: CreateUnitRequest = {
        title: 'Unit Title',
        description: 'Unit Description',
        chapterId: 'chapter-1',
      };

      // When
      const command = CreateUnitMapper.toDomain(currentUser, request);

      // Then
      expect(command).toEqual({
        currentUser: {
          id: 'user-1',
          type: 'ADMIN',
        },
        title: 'Unit Title',
        description: 'Unit Description',
        chapterId: 'chapter-1',
      });
    });
  });

  describe('fromDomain', () => {
    it('should map Unit to CreateUnitResponse', () => {
      // Given
      const now = new Date();
      const unit = new Unit(
        'unit-1',
        'Unit Title',
        'Unit Description',
        'chapter-1',
      );
      unit.isPublished = true;
      unit.createdAt = now;
      unit.updatedAt = now;

      // When
      const response = CreateUnitMapper.fromDomain(unit);

      // Then
      expect(response).toEqual({
        id: 'unit-1',
        title: 'Unit Title',
        description: 'Unit Description',
        chapterId: 'chapter-1',
        isPublished: true,
        createdAt: now,
        updatedAt: now,
      });
    });
  });
});
