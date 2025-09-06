import { ExecuteTransactionMapper } from '../execute-transaction.mapper';
import { ExecuteTransactionRequest } from '../../request/execute-transaction.request';
import { TransactionType } from '../../../../core/domain/type/TransactionType';
import { UserType } from '../../../../core/domain/type/UserType';
import { TokenPayload } from '../../../jwt/jwt.service';

describe('ExecuteTransactionMapper', () => {
  describe('toDomain', () => {
    it('should map ExecuteTransactionRequest and TokenPayload to ExecuteTransactionCommand', () => {
      // Given
      const currentUser: TokenPayload = {
        id: 'user-1',
        email: 'user1@example.com',
        type: UserType.STUDENT,
        portfolioId: 'portfolio-1',
      };
      const request: ExecuteTransactionRequest = {
        tickerId: 'ticker-1',
        type: TransactionType.Buy,
        value: 1000,
      };

      // When
      const command = ExecuteTransactionMapper.toDomain(currentUser, request);

      // Then
      expect(command).toEqual({
        portfolioId: 'portfolio-1',
        tickerId: 'ticker-1',
        type: TransactionType.Buy,
        value: 1000,
      });
    });
  });

  describe('fromDomain', () => {
    it('should map ExecuteTransactionResult to ExecuteTransactionResponse', () => {
      // Given
      const result = {
        cash: 4000,
        investments: 3000,
        tickerHoldings: 1500,
      };

      // When
      const response = ExecuteTransactionMapper.fromDomain(result);

      // Then
      expect(response.cash).toBe(4000);
      expect(response.investments).toBe(3000);
      expect(response.tickerHoldings).toBe(1500);
    });
  });
});
