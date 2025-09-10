import { PrismaUserMapper } from '../prisma-user.mapper';
import { User } from '../../../../core/domain/model/User';
import { User as UserEntity, $Enums } from '@prisma/client';
import { UserType } from '../../../../core/domain/type/UserType';

describe('PrismaUserMapper', () => {
  const mapper = new PrismaUserMapper();

  const userTypeMappings: { domain: UserType; prisma: $Enums.UserType }[] = [
    { domain: UserType.SUPERADMIN, prisma: $Enums.UserType.SUPERADMIN },
    { domain: UserType.ADMIN, prisma: $Enums.UserType.ADMIN },
    { domain: UserType.STUDENT, prisma: $Enums.UserType.STUDENT },
  ];

  describe('fromDomain', () => {
    it.each(userTypeMappings)(
      'should map User to UserEntity for %s',
      ({ domain, prisma }) => {
        // Given
        const user = new User(
          'user-1',
          'user@example.com',
          'securepassword123',
          domain,
          0,
          new Date('2023-10-01T10:00:00Z'),
          new Date('2023-10-01T11:00:00Z'),
        );

        // When
        const entity = mapper.fromDomain(user);

        // Then
        expect(entity).toEqual({
          id: 'user-1',
          email: 'user@example.com',
          password: 'securepassword123',
          type: prisma,
          xp: 0,
          updatedAt: new Date('2023-10-01T10:00:00Z'),
          createdAt: new Date('2023-10-01T11:00:00Z'),
        });
      },
    );
  });

  describe('toDomain', () => {
    it.each(userTypeMappings)(
      'should map UserEntity to User for %s',
      ({ domain, prisma }) => {
        // Given
        const entity: UserEntity = {
          id: 'user-1',
          email: 'user@example.com',
          password: 'securepassword123',
          type: prisma,
          xp: 0,
          updatedAt: new Date('2023-10-01T10:00:00Z'),
          createdAt: new Date('2023-10-01T11:00:00Z'),
        };

        // When
        const user = mapper.toDomain(entity);

        // Then
        expect(user).toEqual({
          id: 'user-1',
          email: 'user@example.com',
          password: 'securepassword123',
          type: domain,
          xp: 0,
          updatedAt: new Date('2023-10-01T10:00:00Z'),
          createdAt: new Date('2023-10-01T11:00:00Z'),
        });
      },
    );

    it('should throw an error for an invalid user type', () => {
      // Given
      const entity: UserEntity = {
        id: 'user-1',
        email: 'user@example.com',
        password: 'securepassword123',
        type: 'INVALID_TYPE' as $Enums.UserType,
        xp: 0,
        updatedAt: new Date('2023-10-01T10:00:00Z'),
        createdAt: new Date('2023-10-01T11:00:00Z'),
      };

      // When & Then
      expect(() => mapper.toDomain(entity)).toThrow('Invalid user type');
    });
  });
});
