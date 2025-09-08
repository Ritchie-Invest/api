import { Body, Controller, Post, UseGuards, Get } from '@nestjs/common';
import { CurrentUser } from '../decorator/current-user.decorator';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ExecuteTransactionUseCase } from '../../../core/usecases/execute-transaction.use-case';
import { GetUserTransactionsUseCase } from '../../../core/usecases/get-user-transactions.use-case';
import { ExecuteTransactionRequest } from '../request/execute-transaction.request';
import { ExecuteTransactionResponse } from '../response/execute-transaction.response';
import { GetUserTransactionsResponse } from '../response/get-user-transactions-response';
import { ExecuteTransactionMapper } from '../mapper/execute-transaction.mapper';
import { GetUserTransactionsMapper } from '../mapper/get-user-transactions.mapper';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { TokenPayload } from '../../jwt/jwt.service';

@Controller('/transaction')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TransactionController {
  constructor(
    private readonly executeTransactionUseCase: ExecuteTransactionUseCase,
    private readonly getUserTransactionsUseCase: GetUserTransactionsUseCase,
  ) {}
  @Get('/user')
  @ApiOperation({ summary: 'Get all transactions for the current user' })
  @ApiCreatedResponse({
    description: 'List of user transactions',
    type: GetUserTransactionsResponse,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async getUserTransactions(
    @CurrentUser() currentUser: TokenPayload,
  ): Promise<GetUserTransactionsResponse> {
    // On suppose que le portfolioId est dans le token
    const result = await this.getUserTransactionsUseCase.execute({
      portfolioId: currentUser.portfolioId,
    });
    return GetUserTransactionsMapper.fromDomain(result);
  }

  @Post('/execute')
  @ApiOperation({ summary: 'Execute a buy or sell transaction' })
  @ApiCreatedResponse({
    description: 'Transaction successfully executed',
    type: ExecuteTransactionResponse,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input or validation error',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  async executeTransaction(
    @CurrentUser() currentUser: TokenPayload,
    @Body() body: ExecuteTransactionRequest,
  ): Promise<ExecuteTransactionResponse> {
    const command = ExecuteTransactionMapper.toDomain(currentUser, body);
    const result = await this.executeTransactionUseCase.execute(command);
    return ExecuteTransactionMapper.fromDomain(result);
  }
}
