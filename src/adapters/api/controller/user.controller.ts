import { Body, Controller, Param, Patch } from '@nestjs/common';
import { UpdateUserTypeRequest } from '../request/update-user-type.request';
import { UpdateUserTypeUseCase } from '../../../core/usecases/update-user-type.use-case';
import { UpdateUserTypeMapper } from '../mapper/update-user-type.mapper';
import { UserType } from '../../../core/domain/type/UserType';
import { User } from '../../../core/domain/model/User';
import { CurrentUser } from '../decorator/current-user.decorator';
import { ProfileRequest } from '../request/profile.request';
import { Roles } from '../decorator/roles.decorator';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
} from '@nestjs/swagger';

@Controller('/users')
export class UserController {
  constructor(private readonly updateUserTypeUseCase: UpdateUserTypeUseCase) {}

  @Patch('/:userId')
  @Roles(UserType.SUPERADMIN)
  @ApiOperation({ summary: 'Update a user type' })
  @ApiCreatedResponse({
    description: 'User type successfully updated',
    type: User,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input or validation error',
  })
  @ApiConflictResponse({
    description: 'User update failed due to conflict',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access',
  })
  @ApiForbiddenResponse({
    description: 'User not allowed to update user type',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  async updateUserType(
    @CurrentUser() currentUser: ProfileRequest,
    @Param('userId') userId: string,
    @Body() body: UpdateUserTypeRequest,
  ): Promise<User> {
    const command = UpdateUserTypeMapper.toDomain(currentUser, userId, body);
    return this.updateUserTypeUseCase.execute(command);
  }
}
