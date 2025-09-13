import { Controller, Get, Query, ParseIntPipe } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { GetPortfolioUseCase } from '../../../core/usecases/get-portfolio.use-case';
import { GetPortfolioPositionsUseCase } from '../../../core/usecases/get-portfolio-positions.use-case';
import { GetPortfolioResponse } from '../response/get-portfolio.response';
import { GetPortfolioPositionsResponse } from '../response/get-portfolio-positions.response';
import { GetPortfolioPositionsMapper } from '../mapper/get-portfolio-positions.mapper';
import { User } from '../../../core/domain/model/User';
import { CurrentUser } from '../decorator/current-user.decorator';

@Controller('portfolio')
export class PortfolioController {
  constructor(
    private readonly getPortfolioUseCase: GetPortfolioUseCase,
    private readonly getPortfolioPositionsUseCase: GetPortfolioPositionsUseCase,
  ) {}

  @Get()
  @ApiOkResponse({
    description: 'Portfolio retrieved successfully',
    type: GetPortfolioResponse,
  })
  @ApiNotFoundResponse({ description: 'Portfolio not found' })
  @ApiBadRequestResponse({ description: 'Invalid user ID' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async getPortfolio(@CurrentUser() user: User): Promise<GetPortfolioResponse> {
    const result = await this.getPortfolioUseCase.execute({
      userId: user.id,
    });

    return new GetPortfolioResponse(
      result.currency,
      result.cash,
      result.investments,
      result.totalValue,
    );
  }

  @Get('positions')
  @ApiOkResponse({
    description: 'Portfolio positions retrieved successfully',
    type: GetPortfolioPositionsResponse,
  })
  @ApiNotFoundResponse({ description: 'Portfolio not found' })
  @ApiBadRequestResponse({ description: 'Invalid user ID or parameters' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of positions to return',
  })
  async getPortfolioPositions(
    @CurrentUser() user: User,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ): Promise<GetPortfolioPositionsResponse> {
    const result = await this.getPortfolioPositionsUseCase.execute({
      userId: user.id,
      limit,
    });

    return GetPortfolioPositionsMapper.toResponse(result);
  }
}
