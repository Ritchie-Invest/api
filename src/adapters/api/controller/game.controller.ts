import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UserType } from '../../../core/domain/type/UserType';
import { CurrentUser } from '../decorator/current-user.decorator';
import { ProfileRequest } from '../request/profile.request';
import { Roles } from '../decorator/roles.decorator';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { CreateGameResponse } from '../response/create-game.response';
import { CreateGameUseCase } from '../../../core/usecases/create-game.use-case';
import { CreateGameRequest } from '../request/create-game.request';
import { CreateGameMapper } from '../mapper/create-game.mapper';
import { UpdateGameUseCase } from '../../../core/usecases/update-game.use-case';
import { UpdateGameResponse } from '../response/update-game.response';
import { UpdateGameMapper } from '../mapper/update-game.mapper';
import { UpdateGameRequest } from '../request/update-game.request';
import { GetGameByIdResponse } from '../response/get-game-by-id.response';
import { GetGameByIdUseCase } from '../../../core/usecases/get-game-by-id.use-case';
import { GetGameByIdMapper } from '../mapper/get-game-by-id.mapper';
import { GetGamesByLessonIdResponse } from '../response/get-games-by-lesson.response';
import { getGamesByLessonIdUseCase } from '../../../core/usecases/get-games-by-lesson.use-case';
import { getGamesByLessonIdMapper } from '../mapper/get-games-by-lesson.mapper';
import { DeleteGameUseCase } from '../../../core/usecases/delete-game.use-case';
import { DeleteGameResponse } from '../response/delete-game.response';
import { DeleteGameMapper } from '../mapper/delete-game.mapper';

@Controller('/games')
export class GameController {
  constructor(
    private readonly getGamesByLessonIdUseCase: getGamesByLessonIdUseCase,
    private readonly createGameUseCase: CreateGameUseCase,
    private readonly getGameByIdUseCase: GetGameByIdUseCase,
    private readonly updateGameUseCase: UpdateGameUseCase,
    private readonly deleteGameUseCase: DeleteGameUseCase,
  ) {}

  @Get('/lesson/:lessonId')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Get all games by lesson ID' })
  @ApiCreatedResponse({
    description: 'Games successfully retrieved',
    type: [GetGamesByLessonIdResponse],
  })
  @ApiBadRequestResponse({
    description: 'Invalid request or parameters',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access',
  })
  @ApiForbiddenResponse({
    description: 'User not allowed to get games',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  async getGamesByLessonId(
    @CurrentUser() currentUser: ProfileRequest,
    @Param('lessonId') lessonId: string,
  ): Promise<GetGamesByLessonIdResponse> {
    const command = getGamesByLessonIdMapper.toDomain(currentUser, lessonId);
    const games = await this.getGamesByLessonIdUseCase.execute(command);
    return getGamesByLessonIdMapper.fromDomain(games);
  }

  @Post('/')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Create a new game' })
  @ApiCreatedResponse({
    description: 'Game successfully created',
    type: CreateGameResponse,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input or validation error',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access',
  })
  @ApiForbiddenResponse({
    description: 'User not allowed to create a game',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  async createGame(
    @CurrentUser() currentUser: ProfileRequest,
    @Body() body: CreateGameRequest,
  ): Promise<CreateGameResponse> {
    const command = CreateGameMapper.toDomain(currentUser, body);
    const game = await this.createGameUseCase.execute(command);
    return CreateGameMapper.fromDomain(game);
  }

  @Get('/:gameId')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Get game by ID' })
  @ApiCreatedResponse({
    description: 'Game successfully retrieved',
    type: GetGameByIdResponse,
  })
  @ApiBadRequestResponse({
    description: 'Invalid game ID format',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access',
  })
  @ApiForbiddenResponse({
    description: 'User not allowed to get game by ID',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  async getGameById(
    @CurrentUser() currentUser: ProfileRequest,
    @Param('gameId') gameId: string,
  ): Promise<GetGameByIdResponse> {
    const command = GetGameByIdMapper.toDomain(currentUser, gameId);
    const game = await this.getGameByIdUseCase.execute(command);
    return GetGameByIdMapper.fromDomain(game);
  }

  @Patch('/:gameId')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Update an existing game' })
  @ApiCreatedResponse({
    description: 'Game successfully updated',
    type: UpdateGameResponse,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input or validation error',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access',
  })
  @ApiForbiddenResponse({
    description: 'User not allowed to update a game',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  async updateGame(
    @CurrentUser() currentUser: ProfileRequest,
    @Param('gameId') gameId: string,
    @Body() body: UpdateGameRequest,
  ): Promise<UpdateGameResponse> {
    const command = UpdateGameMapper.toDomain(currentUser, gameId, body);
    const game = await this.updateGameUseCase.execute(command);
    return UpdateGameMapper.fromDomain(game);
  }

  @Delete('/:gameId')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Delete a game' })
  @ApiCreatedResponse({
    description: 'Game successfully deleted',
    type: DeleteGameResponse,
  })
  @ApiBadRequestResponse({
    description: 'Invalid game ID format',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access',
  })
  @ApiForbiddenResponse({
    description: 'User not allowed to delete a game',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  async deleteGame(
    @CurrentUser() currentUser: ProfileRequest,
    @Param('gameId') gameId: string,
  ): Promise<DeleteGameResponse> {
    const command = DeleteGameMapper.toDomain(currentUser, gameId);
    await this.deleteGameUseCase.execute(command);
    return DeleteGameMapper.fromDomain(gameId);
  }
}
