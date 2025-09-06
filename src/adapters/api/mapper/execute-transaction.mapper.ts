import {
  ExecuteTransactionCommand,
  ExecuteTransactionResult,
} from '../../../core/usecases/execute-transaction.use-case';
import { ExecuteTransactionRequest } from '../request/execute-transaction.request';
import { ExecuteTransactionResponse } from '../response/execute-transaction.response';
import { TokenPayload } from '../../jwt/jwt.service';

export class ExecuteTransactionMapper {
  static toDomain(
    currentUser: TokenPayload,
    request: ExecuteTransactionRequest,
  ): ExecuteTransactionCommand {
    return {
      portfolioId: currentUser.portfolioId,
      tickerId: request.tickerId,
      type: request.type,
      amount: request.amount,
    };
  }

  static fromDomain(
    result: ExecuteTransactionResult,
  ): ExecuteTransactionResponse {
    return new ExecuteTransactionResponse(
      result.cash,
      result.investments,
      result.tickerHoldings,
    );
  }
}
