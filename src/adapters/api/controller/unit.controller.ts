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
import { CreateUnitResponse } from '../response/create-unit.response';
import { CreateUnitUseCase } from '../../../core/usecases/create-unit';
import { CreateUnitRequest } from '../request/create-unit.request';
import { CreateUnitMapper } from '../mapper/create-unit.mapper';
import { UpdateUnitUseCase } from '../../../core/usecases/update-unit.use-case';
import { UpdateUnitResponse } from '../response/update-unit.response';
import { UpdateUnitMapper } from '../mapper/update-unit.mapper';
import { UpdateUnitRequest } from '../request/update-unit.request';
import { GetUnitByIdResponse } from '../response/get-unit-by-id.response';
import { GetUnitByIdUseCase } from '../../../core/usecases/get-units-by-id.use-case';
import { GetUnitByIdMapper } from '../mapper/get-unit-by-id.mapper';
import { getUnitsByChapterIdResponse } from '../response/get-units-by-chapter.response';
import { getUnitsByChapterIdUseCase } from '../../../core/usecases/get-units-by-chapter.use-case';
import { getUnitsByChapterIdMapper } from '../mapper/get-units-by-chapter.mapper';

@Controller('/units')
export class UnitController {
  constructor(
    private readonly getUnitsByChapterIdUseCase: getUnitsByChapterIdUseCase,
    private readonly createUnitUseCase: CreateUnitUseCase,
    private readonly getUnitByIdUseCase: GetUnitByIdUseCase,
    private readonly updateUnitUseCase: UpdateUnitUseCase,
  ) {}

  @Get('/chapter/:chapterId')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Get all units by chapter ID' })
  @ApiCreatedResponse({
    description: 'Units successfully retrieved',
    type: [getUnitsByChapterIdResponse],
  })
  @ApiBadRequestResponse({
    description: 'Invalid request or parameters',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access',
  })
  @ApiForbiddenResponse({
    description: 'User not allowed to get units',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  async getUnitsByChapterId(
    @CurrentUser() currentUser: ProfileRequest,
    @Param('chapterId') chapterId: string,
  ): Promise<getUnitsByChapterIdResponse> {
    const command = getUnitsByChapterIdMapper.toDomain(currentUser, chapterId);
    const units = await this.getUnitsByChapterIdUseCase.execute(command);
    return getUnitsByChapterIdMapper.fromDomain(units);
  }

  @Post('/')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Create a new unit' })
  @ApiCreatedResponse({
    description: 'Unit successfully created',
    type: CreateUnitResponse,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input or validation error',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access',
  })
  @ApiForbiddenResponse({
    description: 'User not allowed to create a unit',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  async createUnit(
    @CurrentUser() currentUser: ProfileRequest,
    @Body() body: CreateUnitRequest,
  ): Promise<CreateUnitResponse> {
    const command = CreateUnitMapper.toDomain(currentUser, body);
    const unit = await this.createUnitUseCase.execute(command);
    return CreateUnitMapper.fromDomain(unit);
  }

  @Get('/:unitId')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Get unit by ID' })
  @ApiCreatedResponse({
    description: 'Unit successfully retrieved',
    type: GetUnitByIdResponse,
  })
  @ApiBadRequestResponse({
    description: 'Invalid unit ID format',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access',
  })
  @ApiForbiddenResponse({
    description: 'User not allowed to get unit by ID',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  async getUnitById(
    @CurrentUser() currentUser: ProfileRequest,
    @Param('unitId') unitId: string,
  ): Promise<GetUnitByIdResponse> {
    const command = GetUnitByIdMapper.toDomain(currentUser, unitId);
    const unit = await this.getUnitByIdUseCase.execute(command);
    return GetUnitByIdMapper.fromDomain(unit);
  }

  @Patch('/:unitId')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Update an existing unit' })
  @ApiCreatedResponse({
    description: 'Unit successfully updated',
    type: UpdateUnitResponse,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input or validation error',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access',
  })
  @ApiForbiddenResponse({
    description: 'User not allowed to update a unit',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  async updateUnit(
    @CurrentUser() currentUser: ProfileRequest,
    @Param('unitId') unitId: string,
    @Body() body: UpdateUnitRequest,
  ): Promise<UpdateUnitResponse> {
    const command = UpdateUnitMapper.toDomain(currentUser, unitId, body);
    const unit = await this.updateUnitUseCase.execute(command);
    return UpdateUnitMapper.fromDomain(unit);
  }
}
