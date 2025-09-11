import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
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
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiOkResponse,
} from '@nestjs/swagger';
import { UpdateUserTypeResponse } from '../response/update-user-type.response';
import { GetUserProfileUseCase } from '../../../core/usecases/get-user-profile.use-case';
import { GetMeMapper } from '../mapper/get-me.mapper';
import { GetMeResponse } from '../response/get-me.response';

@Controller('/users')
export class UserController {
  constructor(
    private readonly updateUserTypeUseCase: UpdateUserTypeUseCase,
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
  ) {}

  @Get('/me')
  @ApiOperation({ summary: "Get current user's information" })
  @ApiOkResponse({
    description: 'Current user information retrieved successfully',
    type: GetMeResponse,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async getMe(
    @CurrentUser() currentUser: ProfileRequest,
  ): Promise<GetMeResponse> {
    const command = GetMeMapper.toDomain(currentUser);
    const result = await this.getUserProfileUseCase.execute(command);
    return GetMeMapper.fromDomain(result);
  }

  @Patch('/:userId')
  @Roles(UserType.SUPERADMIN)
  @ApiOperation({ summary: 'Update a user type' })
  @ApiOkResponse({
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
  ): Promise<UpdateUserTypeResponse> {
    const command = UpdateUserTypeMapper.toDomain(currentUser, userId, body);
    const user = await this.updateUserTypeUseCase.execute(command);
    return UpdateUserTypeMapper.fromDomain(user);
  }
}
