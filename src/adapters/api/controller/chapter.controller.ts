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
import { CreateChapterResponse } from '../response/create-chapter.response';
import { CreateChapterUseCase } from '../../../core/usecases/create-chapter.use-case';
import { CreateChapterRequest } from '../request/create-chapter.request';
import { CreateChapterMapper } from '../mapper/create-chapter.mapper';
import { UpdateChapterUseCase } from '../../../core/usecases/update-chapter.use-case';
import { UpdateChapterResponse } from '../response/update-chapter.response';
import { UpdateChapterMapper } from '../mapper/update-chapter.mapper';
import { UpdateChapterRequest } from '../request/update-chapter.request';
import { GetChapterByIdResponse } from '../response/get-chapter-by-id.response';
import { GetChapterByIdUseCase } from '../../../core/usecases/get-chapter-by-id.use-case';
import { GetChapterByIdMapper } from '../mapper/get-chapter-by-id.mapper';
import { GetChaptersResponse } from '../response/get-chapters.response';
import { GetChaptersUseCase } from '../../../core/usecases/get-chapters.use-case';
import { GetChaptersMapper } from '../mapper/get-chapters.mapper';

@Controller('/chapters')
export class ChapterController {
  constructor(
    private readonly getChaptersUseCase: GetChaptersUseCase,
    private readonly createChapterUseCase: CreateChapterUseCase,
    private readonly getChapterByIdUseCase: GetChapterByIdUseCase,
    private readonly updateChapterUseCase: UpdateChapterUseCase,
  ) {}

  @Get('/')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Get all chapters' })
  @ApiCreatedResponse({
    description: 'Chapters successfully retrieved',
    type: [GetChaptersResponse],
  })
  @ApiBadRequestResponse({
    description: 'Invalid request or parameters',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access',
  })
  @ApiForbiddenResponse({
    description: 'User not allowed to get chapters',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  async getChapters(
    @CurrentUser() currentUser: ProfileRequest,
  ): Promise<GetChaptersResponse> {
    const command = GetChaptersMapper.toDomain(currentUser);
    const chapters = await this.getChaptersUseCase.execute(command);
    return GetChaptersMapper.fromDomain(chapters);
  }

  @Post('/')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Create a new chapter' })
  @ApiCreatedResponse({
    description: 'Chapter successfully created',
    type: CreateChapterResponse,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input or validation error',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access',
  })
  @ApiForbiddenResponse({
    description: 'User not allowed to create a chapter',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  async createChapter(
    @CurrentUser() currentUser: ProfileRequest,
    @Body() body: CreateChapterRequest,
  ): Promise<CreateChapterResponse> {
    const command = CreateChapterMapper.toDomain(currentUser, body);
    const chapter = await this.createChapterUseCase.execute(command);
    return CreateChapterMapper.fromDomain(chapter);
  }

  @Get('/:chapterId')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Get chapter by ID' })
  @ApiCreatedResponse({
    description: 'Chapter successfully retrieved',
    type: GetChapterByIdResponse,
  })
  @ApiBadRequestResponse({
    description: 'Invalid chapter ID format',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access',
  })
  @ApiForbiddenResponse({
    description: 'User not allowed to get chapter by ID',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  async getChapterById(
    @CurrentUser() currentUser: ProfileRequest,
    @Param('chapterId') chapterId: string,
  ): Promise<GetChapterByIdResponse> {
    const command = GetChapterByIdMapper.toDomain(currentUser, chapterId);
    const chapter = await this.getChapterByIdUseCase.execute(command);
    return GetChapterByIdMapper.fromDomain(chapter);
  }

  @Patch('/:chapterId')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Update an existing chapter' })
  @ApiCreatedResponse({
    description: 'Chapter successfully updated',
    type: UpdateChapterResponse,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input or validation error',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access',
  })
  @ApiForbiddenResponse({
    description: 'User not allowed to update a chapter',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  async updateChapter(
    @CurrentUser() currentUser: ProfileRequest,
    @Param('chapterId') chapterId: string,
    @Body() body: UpdateChapterRequest,
  ): Promise<UpdateChapterResponse> {
    const command = UpdateChapterMapper.toDomain(currentUser, chapterId, body);
    const chapter = await this.updateChapterUseCase.execute(command);
    return UpdateChapterMapper.fromDomain(chapter);
  }
}
