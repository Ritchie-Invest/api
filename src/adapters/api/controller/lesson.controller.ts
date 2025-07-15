import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
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
import { CreateLessonResponse } from '../response/create-lesson.response';
import { CreateLessonUseCase } from '../../../core/usecases/create-lesson.use-case';
import { CreateLessonRequest } from '../request/create-lesson.request';
import { CreateLessonMapper } from '../mapper/create-lesson.mapper';
import { UpdateLessonUseCase } from '../../../core/usecases/update-lesson.use-case';
import { UpdateLessonResponse } from '../response/update-lesson.response';
import { UpdateLessonMapper } from '../mapper/update-lesson.mapper';
import { UpdateLessonRequest } from '../request/update-lesson.request';
import { GetLessonByIdResponse } from '../response/get-lesson-by-id.response';
import { GetLessonByIdUseCase } from '../../../core/usecases/get-lesson-by-id.use-case';
import { GetLessonByIdMapper } from '../mapper/get-lesson-by-id.mapper';
import { GetLessonsByChapterIdResponse } from '../response/get-lessons-by-chapter.response';
import { GetLessonsByChapterIdUseCase } from '../../../core/usecases/get-lessons-by-chapter.use-case';
import { GetLessonsByChapterIdMapper } from '../mapper/get-lessons-by-chapter.mapper';
import { CreateGameModuleUseCase } from '../../../core/usecases/create-game-module.use-case';
import { CreateGameModuleRequest } from '../request/create-game-module.request';
import { CreateGameModuleMapper } from '../mapper/create-game-module.mapper';
import { CompleteLessonMapper } from '../mapper/complete-lesson.mapper';
import { CompleteLessonUseCase } from '../../../core/usecases/complete-lesson.use-case';
import { CompleteLessonResponse } from '../response/complete-lesson.response';

@Controller('/lessons')
export class LessonController {
  constructor(
    private readonly getLessonsByChapterIdUseCase: GetLessonsByChapterIdUseCase,
    private readonly createLessonUseCase: CreateLessonUseCase,
    private readonly getLessonByIdUseCase: GetLessonByIdUseCase,
    private readonly updateLessonUseCase: UpdateLessonUseCase,
    private readonly createGameModuleUseCase: CreateGameModuleUseCase,
    private readonly completeLessonUseCase: CompleteLessonUseCase,
  ) {}

  @Get('/chapter/:chapterId')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Get all lessons by chapter ID' })
  @ApiCreatedResponse({
    description: 'Lessons successfully retrieved',
    type: [GetLessonsByChapterIdResponse],
  })
  @ApiBadRequestResponse({
    description: 'Invalid request or parameters',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access',
  })
  @ApiForbiddenResponse({
    description: 'User not allowed to get lessons',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  async getLessonsByChapterId(
    @CurrentUser() currentUser: ProfileRequest,
    @Param('chapterId') chapterId: string,
  ): Promise<GetLessonsByChapterIdResponse> {
    const command = GetLessonsByChapterIdMapper.toDomain(
      currentUser,
      chapterId,
    );
    const lessons = await this.getLessonsByChapterIdUseCase.execute(command);
    return GetLessonsByChapterIdMapper.fromDomain(lessons);
  }

  @Post('/')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Create a new lesson' })
  @ApiCreatedResponse({
    description: 'Lesson successfully created',
    type: CreateLessonResponse,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input or validation error',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access',
  })
  @ApiForbiddenResponse({
    description: 'User not allowed to create a lesson',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  async createLesson(
    @CurrentUser() currentUser: ProfileRequest,
    @Body() body: CreateLessonRequest,
  ): Promise<CreateLessonResponse> {
    const command = CreateLessonMapper.toDomain(currentUser, body);
    const lesson = await this.createLessonUseCase.execute(command);
    return CreateLessonMapper.fromDomain(lesson);
  }

  @Get('/:lessonId')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Get lesson by ID' })
  @ApiCreatedResponse({
    description: 'Lesson successfully retrieved',
    type: GetLessonByIdResponse,
  })
  @ApiBadRequestResponse({
    description: 'Invalid lesson ID format',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access',
  })
  @ApiForbiddenResponse({
    description: 'User not allowed to get lesson by ID',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  async getLessonById(
    @CurrentUser() currentUser: ProfileRequest,
    @Param('lessonId') lessonId: string,
  ): Promise<GetLessonByIdResponse> {
    const command = GetLessonByIdMapper.toDomain(currentUser, lessonId);
    const lesson = await this.getLessonByIdUseCase.execute(command);
    return GetLessonByIdMapper.fromDomain(lesson);
  }

  @Patch('/:lessonId')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Update an existing lesson' })
  @ApiCreatedResponse({
    description: 'Lesson successfully updated',
    type: UpdateLessonResponse,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input or validation error',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access',
  })
  @ApiForbiddenResponse({
    description: 'User not allowed to update a lesson',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  async updateLesson(
    @CurrentUser() currentUser: ProfileRequest,
    @Param('lessonId') lessonId: string,
    @Body() body: UpdateLessonRequest,
  ): Promise<UpdateLessonResponse> {
    const command = UpdateLessonMapper.toDomain(currentUser, lessonId, body);
    const lesson = await this.updateLessonUseCase.execute(command);
    return UpdateLessonMapper.fromDomain(lesson);
  }

  @Post('/:lessonId/modules')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Create a game module for a lesson' })
  @ApiCreatedResponse({
    description: 'Game module successfully created',
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
  async createGameModule(
    @Param('lessonId') lessonId: string,
    @Body() request: CreateGameModuleRequest,
  ): Promise<CreateLessonResponse> {
    const command = CreateGameModuleMapper.toDomain(lessonId, request);
    const result = await this.createGameModuleUseCase.execute(command);
    return CreateGameModuleMapper.fromDomain(result);
  }

  @Post('/:lessonId/complete')
  @ApiOperation({ summary: 'Complete a lesson' })
  @ApiCreatedResponse({
    description: 'Lesson successfully completed',
    type: CompleteLessonResponse,
  })
  @ApiBadRequestResponse({
    description: 'Invalid request or parameters',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access',
  })
  async completeLesson(
    @CurrentUser() currentUser: ProfileRequest,
    @Param('lessonId') lessonId: string,
  ): Promise<CompleteLessonResponse> {
    const command = CompleteLessonMapper.toDomain(currentUser.id, lessonId);
    const result = await this.completeLessonUseCase.execute(command);
    return CompleteLessonMapper.fromDomain(result);
  }
}
