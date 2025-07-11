import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CompleteGameModuleUseCase } from '../../../core/usecases/complete-game-module.use-case';
import { CompleteGameModuleRequest } from '../request/complete-game-module.request';
import { CompleteGameModuleResponse } from '../response/complete-game-module.response';
import { CompleteGameModuleMapper } from '../mapper/complete-game-module.mapper';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ProfileRequest } from '../request/profile.request';
import { CurrentUser } from '../decorator/current-user.decorator';
import { GetGameModuleByIdUseCase } from '../../../core/usecases/get-game-module-by-id.use-case';
import { GetGameModuleByIdResponse } from '../response/get-game-module-by-id.response';
import { GetGameModuleByIdMapper } from '../mapper/get-game-module-by-id.mapper';
import { GetLightGameModuleByIdMapper } from '../mapper/get-light-game-module-by-id.mapper';
import { UserType } from '../../../core/domain/type/UserType';
import { UpdateGameModuleUseCase } from '../../../core/usecases/update-game-module.use-case';
import { Roles } from '../decorator/roles.decorator';
import { CreateLessonResponse } from '../response/create-lesson.response';
import { UpdateGameModuleRequest } from '../request/update-game-module.request';
import { UpdateGameModuleMapper } from '../mapper/update-game-module.mapper';

@ApiTags('GameModules')
@Controller('/modules')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GameModuleController {
  constructor(
    private readonly updateGameModuleUseCase: UpdateGameModuleUseCase,
    private readonly completeGameModuleUseCase: CompleteGameModuleUseCase,
    private readonly getGameModuleByIdUseCase: GetGameModuleByIdUseCase,
  ) {}

  @Get('/:moduleId')
  @ApiOperation({ summary: 'Get a game module by id' })
  @ApiParam({
    name: 'moduleId',
    description: 'The ID of the game module',
    example: 'module-456',
  })
  @ApiCreatedResponse({
    description: 'Game module fetched successfully',
    type: GetGameModuleByIdResponse,
  })
  @ApiNotFoundResponse({
    description: 'Game module not found',
  })
  async getGameModuleById(
    @Param('moduleId') moduleId: string,
    @CurrentUser() currentUser: ProfileRequest,
  ): Promise<GetGameModuleByIdResponse> {
    const command = GetGameModuleByIdMapper.toDomain(moduleId);
    const result = await this.getGameModuleByIdUseCase.execute(command);
    if (currentUser.type === UserType.ADMIN) {
      return GetGameModuleByIdMapper.fromDomain(result);
    }
    return GetLightGameModuleByIdMapper.fromDomain(result);
  }

  @Post('/:moduleId')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Update a game module for a lesson' })
  @ApiCreatedResponse({
    description: 'Game module successfully updated',
    type: CreateLessonResponse,
  })
  @ApiBadRequestResponse({
    description: 'Invalid request or parameters',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access',
  })
  @ApiForbiddenResponse({
    description: 'User not allowed to create game module',
  })
  async updateGameModule(
    @Param('moduleId') moduleId: string,
    @Body() request: UpdateGameModuleRequest,
  ): Promise<CreateLessonResponse> {
    const command = UpdateGameModuleMapper.toDomain(moduleId, request);
    const result = await this.updateGameModuleUseCase.execute(command);
    return UpdateGameModuleMapper.fromDomain(result);
  }

  @Post('/:moduleId/complete')
  @ApiOperation({ summary: 'Complete a game module with an answer' })
  @ApiParam({
    name: 'moduleId',
    description: 'The ID of the game module',
    example: 'module-456',
  })
  @ApiCreatedResponse({
    description: 'Game module completed successfully',
    type: CompleteGameModuleResponse,
  })
  @ApiBadRequestResponse({
    description: 'Invalid or empty answer provided',
  })
  @ApiNotFoundResponse({
    description: 'Game module not found',
  })
  async completeGameModule(
    @Param('moduleId') moduleId: string,
    @Body() body: CompleteGameModuleRequest,
    @CurrentUser() currentUser: ProfileRequest,
  ): Promise<CompleteGameModuleResponse> {
    const command = CompleteGameModuleMapper.toDomain(
      currentUser.id,
      moduleId,
      body,
    );
    const result = await this.completeGameModuleUseCase.execute(command);
    return CompleteGameModuleMapper.fromDomain(result);
  }
}
