import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserUseCase } from '../../../core/usecases/create-user.use-case';
import { LoginUseCase } from '../../../core/usecases/login.use-case';
import { LogoutUseCase } from '../../../core/usecases/logout.use-case';
import { RefreshUseCase } from '../../../core/usecases/refresh.use-case';
import { CreateUserRequest } from '../request/create-user.request';
import { ProfileRequest } from '../request/profile.request';
import { LoginResponse } from '../response/login.response';
import { UserMapper } from '../mapper/user.mapper';
import { LogoutMapper } from '../mapper/logout.mapper';
import { User } from '../../../core/domain/model/User';
import { CurrentUser } from '../decorator/current-user.decorator';
import { Public } from '../decorator/public.decorator';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@Controller('/auth')
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly refreshUseCase: RefreshUseCase,
  ) {}

  @Public()
  @Post('/register')
  @ApiCreatedResponse({
    description: 'User successfully registered',
    type: User,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input or validation error',
  })
  @ApiConflictResponse({
    description: 'User already exists or registration failed due to conflict',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  async register(@Body() body: CreateUserRequest): Promise<User> {
    const command = UserMapper.toDomain(body);
    return this.createUserUseCase.execute(command);
  }

  @Public()
  @Post('/login')
  @ApiCreatedResponse({
    description: 'User successfully logged in',
    type: LoginResponse,
  })
  @ApiNotFoundResponse({
    description: 'User not found or invalid credentials',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  async login(@Body() body: CreateUserRequest): Promise<LoginResponse> {
    const command = UserMapper.toDomain(body);
    return await this.loginUseCase.execute(command);
  }

  @Post('/logout')
  @ApiCreatedResponse({
    description: 'User successfully logged out',
    type: LoginResponse,
  })
  @ApiNotFoundResponse({
    description: 'User not found or invalid credentials',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  async logout(
    @CurrentUser() currentUser: ProfileRequest,
    @Body('refreshToken') refreshToken: string,
  ): Promise<void> {
    const command = LogoutMapper.toDomain(currentUser, refreshToken);
    return this.logoutUseCase.execute(command);
  }

  @Post('/refresh')
  @ApiOkResponse({
    description: 'User token refreshed successfully',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access',
  })
  async refresh(@Body('refreshToken') token: string): Promise<LoginResponse> {
    return this.refreshUseCase.execute({ token });
  }
}
