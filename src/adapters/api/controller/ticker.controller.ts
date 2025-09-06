import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { GetTickersWithPriceUseCase } from '../../../core/usecases/get-tickers-with-price.use-case';
import { GetTickersResponse } from '../response/get-tickers.response';
import { GetTickersMapper } from '../mapper/get-tickers.mapper';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';

@Controller('/tickers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TickerController {
  constructor(
    private readonly getTickersWithPriceUseCase: GetTickersWithPriceUseCase,
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
}
