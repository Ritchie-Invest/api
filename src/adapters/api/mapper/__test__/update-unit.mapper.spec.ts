import { UpdateUnitMapper } from '../update-unit.mapper';
import { ProfileRequest } from '../../request/profile.request';
import { UserType } from '../../../../core/domain/type/UserType';
import { UpdateUnitRequest } from '../../request/update-unit.request';
import { Unit } from '../../../../core/domain/model/Unit';

describe('UpdateUnitMapper', () => {
  describe('toDomain', () => {
    it('should map ProfileRequest, unitId, and UpdateUnitRequest to UpdateUnitCommand', () => {
      // Given
      const currentUser: ProfileRequest = {
        id: 'user-1',
        email: 'user1@example.com',
        type: UserType.ADMIN,
      };
      const unitId = 'unit-1';
      const request: UpdateUnitRequest = {
        title: 'Updated Title',
        description: 'Updated Description',
        isPublished: true,
      };

      // When
      const command = UpdateUnitMapper.toDomain(currentUser, unitId, request);

      // Then
      expect(command).toEqual({
        currentUser: {
          id: 'user-1',
          type: UserType.ADMIN,
        },
        unitId: 'unit-1',
        title: 'Updated Title',
        description: 'Updated Description',
        isPublished: true,
      });
    });
  });

  describe('fromDomain', () => {
    it('should map Unit to UpdateUnitResponse', () => {
      // Given
      const now = new Date();
      const unit = new Unit(
        'unit-1',
        'Updated Title',
        'Updated Description',
        'chapter-1',
      );
      unit.isPublished = true;
      unit.createdAt = now;
      unit.updatedAt = now;

      // When
      const response = UpdateUnitMapper.fromDomain(unit);

      // Then
      expect(response).toEqual({
        id: 'unit-1',
        chapterId: 'chapter-1',
        title: 'Updated Title',
        description: 'Updated Description',
        isPublished: true,
        createdAt: now,
        updatedAt: now,
      });
    });
  });
});
