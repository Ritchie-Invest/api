import { ProfileRequest } from '../../request/profile.request';
import { UserType } from '../../../../core/domain/type/UserType';
import { UpdateUserTypeMapper } from '../update-user-type.mapper';
import { User } from '../../../../core/domain/model/User';

describe('UpdateUserTypeMapper', () => {
  describe('toDomain', () => {
    it('should map ProfileRequest, userId, and UpdateUserTypeRequest to UpdateUserTypeCommand', () => {
      // Given
      const currentUser: ProfileRequest = {
        id: 'user-1',
        email: 'user@example.com',
        type: UserType.ADMIN,
      };
      const userId = 'user-123';
      const request = {
        type: UserType.STUDENT,
      };

      // When
      const command = UpdateUserTypeMapper.toDomain(
        currentUser,
        userId,
        request,
      );

      // Then
      expect(command).toEqual({
        currentUser: {
          id: 'user-1',
          type: UserType.ADMIN,
        },
        userId: 'user-123',
        type: UserType.STUDENT,
      });
    });
  });

  describe('fromDomain', () => {
    it('should map User to UpdateUserTypeResponse', () => {
      // Given
      const user: User = {
        id: 'user-123',
        email: 'user@example.com',
        password: 'hashOfPassword',
        type: UserType.STUDENT,
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-02T00:00:00Z'),
      };

      // When
      const response = UpdateUserTypeMapper.fromDomain(user);

      // Then
      expect(response).toEqual({
        id: 'user-123',
        email: 'user@example.com',
        type: UserType.STUDENT,
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-02T00:00:00Z'),
      });
    });
  });
});
