import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../decorator/current-user.decorator';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ExecuteTransactionUseCase } from '../../../core/usecases/ExecuteTransactionUseCase';
import { ExecuteTransactionRequest } from '../request/execute-transaction.request';
import { ExecuteTransactionResponse } from '../response/execute-transaction.response';
import { ExecuteTransactionMapper } from '../mapper/execute-transaction.mapper';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { TokenPayload } from '../../jwt/jwt.service';

@Controller('/transaction')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TransactionController {
  constructor(
    private readonly executeTransactionUseCase: ExecuteTransactionUseCase,
  ) {}

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
