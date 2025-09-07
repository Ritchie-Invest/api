import { Controller, Get, Param, UseGuards, Inject } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiParam,
} from '@nestjs/swagger';
import { GetTickersWithPriceUseCase } from '../../../core/usecases/get-tickers-with-price.use-case';
import { GetTickersResponse } from '../response/get-tickers.response';
import { GetTickersMapper } from '../mapper/get-tickers.mapper';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { GetTickerPossessedValueUseCase } from '../../../core/usecases/get-ticker-possessed-value.use-case';
import { GetTickerPossessedValueResponse } from '../response/get-ticker-possessed-value.response';
import { GetTickerPossessedValueMapper } from '../mapper/get-ticker-possessed-value.mapper';
import { GetUserTickersUseCase } from '../../../core/usecases/get-user-tickers.use-case';
import { GetUserTickersResponse } from '../response/get-user-tickers.response';
import { GetUserTickersMapper } from '../mapper/get-user-tickers.mapper';
import { UserPortfolioRepository } from '../../../core/domain/repository/user-portfolio.repository';
import { CurrentUser } from '../decorator/current-user.decorator';
import { TokenPayload } from '../../jwt/jwt.service';

@Controller('/tickers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TickerController {
  constructor(
    private readonly getTickersWithPriceUseCase: GetTickersWithPriceUseCase,
    private readonly getTickerPossessedValueUseCase: GetTickerPossessedValueUseCase,
    private readonly getUserTickersUseCase: GetUserTickersUseCase,
    @Inject('UserPortfolioRepository')
    private readonly userPortfolioRepository: UserPortfolioRepository,
  ) {}

  @Get('/')
  @ApiOperation({ summary: 'Get all tickers with latest price and variation' })
  @ApiCreatedResponse({
    description: 'Tickers successfully retrieved',
    type: GetTickersResponse,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async getTickers(): Promise<GetTickersResponse> {
    const tickers = await this.getTickersWithPriceUseCase.execute();
    return GetTickersMapper.fromDomain(tickers);
  }

  @Get('/:tickerId/possessed-value')
  @ApiOperation({ summary: 'Get possessed value for a specific ticker' })
  @ApiParam({
    name: 'tickerId',
    description: 'ID of the ticker',
    type: 'string',
  })
  @ApiCreatedResponse({
    description: 'Ticker possessed value successfully retrieved',
    type: GetTickerPossessedValueResponse,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async getTickerPossessedValue(
    @CurrentUser() currentUser: TokenPayload,
    @Param('tickerId') tickerId: string,
  ): Promise<GetTickerPossessedValueResponse> {
    const result = await this.getTickerPossessedValueUseCase.execute({
      userId: currentUser.id,
      tickerId,
    });
    return GetTickerPossessedValueMapper.fromDomain(result);
  }

  @Get('/owned')
  @ApiOperation({ summary: 'Get ETFs owned by the current user' })
  @ApiCreatedResponse({
    description: 'User ETFs successfully retrieved',
    type: GetUserTickersResponse,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async getUserTickers(
    @CurrentUser() currentUser: TokenPayload,
  ): Promise<GetUserTickersResponse> {
    const userPortfolio = await this.userPortfolioRepository.findByUserId(
      currentUser.id,
    );

    if (!userPortfolio) {
      throw new Error('Portfolio not found for user');
    }

    const result = await this.getUserTickersUseCase.execute({
      portfolioId: userPortfolio.id,
    });
    return GetUserTickersMapper.fromDomain(result);
  }
}
