import { Controller, Get } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { GetPortfolioUseCase } from '../../../core/usecases/get-portfolio.use-case';
import { GetPortfolioResponse } from '../response/get-portfolio.response';
import { User } from '../../../core/domain/model/User';
import { CurrentUser } from '../decorator/current-user.decorator';

@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly getPortfolioUseCase: GetPortfolioUseCase) {}

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
}
