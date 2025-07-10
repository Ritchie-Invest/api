import {
  Body,
  Controller,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CompleteGameModuleUseCase } from '../../../core/usecases/complete-game-module.use-case';
import { CompleteGameModuleRequest } from '../request/complete-game-module.request';
import { CompleteGameModuleResponse } from '../response/complete-game-module.response';
import { CompleteGameModuleMapper } from '../mapper/complete-game-module.mapper';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ProfileRequest } from '../request/profile.request';
import { CurrentUser } from '../decorator/current-user.decorator';

@ApiTags('GameModules')
@Controller('/v1/modules')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GameModuleController {
  constructor(
    private readonly completeGameModuleUseCase: CompleteGameModuleUseCase,
  ) {}

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
