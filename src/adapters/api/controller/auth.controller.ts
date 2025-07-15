import {
  Body,
  Controller,
  Post,
  Res,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { CreateUserUseCase } from '../../../core/usecases/create-user.use-case';
import { LoginUseCase } from '../../../core/usecases/login.use-case';
import { LogoutUseCase } from '../../../core/usecases/logout.use-case';
import { RefreshUseCase } from '../../../core/usecases/refresh.use-case';
import { RegisterRequest } from '../request/register.request';
import { ProfileRequest } from '../request/profile.request';
import { LoginResponse } from '../response/login.response';
import { RegisterMapper } from '../mapper/register.mapper';
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
import { RegisterResponse } from '../response/register.response';
import { LoginMapper } from '../mapper/login.mapper';

export type LoginApiResponse = {
  accessToken: string;
};

@Controller('/auth')
export class AuthController {
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
  async register(@Body() body: RegisterRequest): Promise<RegisterResponse> {
    const command = RegisterMapper.toDomain(body);
    const user = await this.createUserUseCase.execute(command);
    return RegisterMapper.fromDomain(user);
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
  async login(
    @Body() body: RegisterRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginApiResponse> {
    const command = LoginMapper.toDomain(body);
    const result = await this.loginUseCase.execute(command);
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return { accessToken: result.accessToken };
  }

  @Post('/logout')
  @ApiCreatedResponse({
    description: 'User successfully logged out',
  })
  @ApiNotFoundResponse({
    description: 'User not found or invalid credentials',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  async logout(
    @CurrentUser() currentUser: ProfileRequest,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const refreshTokenUnknown: unknown = req.cookies?.['refreshToken'];
    if (typeof refreshTokenUnknown !== 'string') {
      res.clearCookie('refreshToken', { path: '/auth' });
      return;
    }
    const refreshTokenRaw = refreshTokenUnknown;
    const command = LogoutMapper.toDomain(currentUser, refreshTokenRaw);
    await this.logoutUseCase.execute(command);
    res.clearCookie('refreshToken', { path: '/auth' });
  }

  @Public()
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
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginApiResponse> {
    const tokenUnknown: unknown = req.cookies?.['refreshToken'];
    if (typeof tokenUnknown !== 'string') {
      throw new UnauthorizedException('Refresh token missing');
    }
    const tokenRaw = tokenUnknown;
    try {
      const result = await this.refreshUseCase.execute({ token: tokenRaw });
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/auth',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.status(200);
      return { accessToken: result.accessToken };
    } catch (err) {
      console.error('[AUTH/REFRESH] Error during refresh:', err);
      throw err;
    }
  }
}
