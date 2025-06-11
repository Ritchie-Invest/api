import { GetUnitByIdMapper } from '../get-unit-by-id.mapper';
import { ProfileRequest } from '../../request/profile.request';
import { UserType } from '../../../../core/domain/type/UserType';
import { Unit } from '../../../../core/domain/model/Unit';

describe('GetUnitByIdMapper', () => {
  describe('toDomain', () => {
    it('should map ProfileRequest and unitId to GetUnitByIdCommand', () => {
      // Given
      const currentUser: ProfileRequest = {
        id: 'user-1',
        email: 'user1@example.com',
        type: UserType.ADMIN,
      };
      const unitId = 'unit-1';

      // When
      const command = GetUnitByIdMapper.toDomain(currentUser, unitId);

      // Then
      expect(command).toEqual({
        currentUser: {
          id: 'user-1',
          type: UserType.ADMIN,
        },
        unitId: 'unit-1',
      });
    });
  });

  describe('fromDomain', () => {
    it('should map Unit to GetUnitByIdResponse', () => {
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
      const response = GetUnitByIdMapper.fromDomain(unit);

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