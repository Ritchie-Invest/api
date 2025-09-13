import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { UpdateUserTypeRequest } from '../request/update-user-type.request';
import { UpdateUserTypeUseCase } from '../../../core/usecases/update-user-type.use-case';
import { UpdateUserTypeMapper } from '../mapper/update-user-type.mapper';
import { UserType } from '../../../core/domain/type/UserType';
import { User } from '../../../core/domain/model/User';
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
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { UpdateUserTypeResponse } from '../response/update-user-type.response';
import { GetUserProfileUseCase } from '../../../core/usecases/get-user-profile.use-case';
import { GetMeMapper } from '../mapper/get-me.mapper';
import { GetMeResponse } from '../response/get-me.response';
import { GetUserProgressResponse } from '../response/get-user-progress.response';
import { GetUserProgressMapper } from '../mapper/get-user-progress.mapper';
import { GetUserProgressUseCase } from '../../../core/usecases/get-user-progress-use-case.service';
import { GetUserBadgesUseCase } from '../../../core/usecases/get-user-badges.use-case';
import { GetBadgeCatalogUseCase } from '../../../core/usecases/get-badge-catalog.use-case';
import { GetBadgeCatalogMapper } from '../mapper/get-badge-catalog.mapper';
import { CurrentUser } from '../decorator/current-user.decorator';

@Controller('/users')
export class UserController {
  constructor(
    private readonly updateUserTypeUseCase: UpdateUserTypeUseCase,
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
    private readonly getUserProgressUseCase: GetUserProgressUseCase,
    private readonly getUserBadgesUseCase: GetUserBadgesUseCase,
    private readonly getBadgeCatalogUseCase: GetBadgeCatalogUseCase,
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

  @Get('/progress')
  @ApiOperation({ summary: 'Get user chapters with progress' })
  @ApiCreatedResponse({
    description: 'User chapters with progress successfully retrieved',
    type: GetUserProgressResponse,
  })
  @ApiBadRequestResponse({
    description: 'Invalid request or parameters',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  async getUserProgress(
    @CurrentUser() currentUser: ProfileRequest,
  ): Promise<GetUserProgressResponse> {
    const command = GetUserProgressMapper.toDomain(currentUser);
    const result = await this.getUserProgressUseCase.execute(command);
    return GetUserProgressMapper.fromDomain(result);
  }

  @Get('me/badges')
  @ApiOperation({
    summary: 'List all badges with award status for current user',
  })
  @ApiOkResponse({
    description: 'All badges with awardedAt for current user',
    isArray: true,
  })
  async getMyBadges(@CurrentUser() currentUser: ProfileRequest) {
    const items = await this.getBadgeCatalogUseCase.execute(currentUser.id);
    return GetBadgeCatalogMapper.fromDomain(items);
  }
}
