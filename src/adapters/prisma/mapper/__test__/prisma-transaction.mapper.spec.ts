import { PrismaTransactionMapper } from '../prisma-transaction.mapper';
import { Transaction } from '../../../../core/domain/model/Transaction';
import { Transaction as TransactionEntity, $Enums } from '@prisma/client';
import { TransactionType } from '../../../../core/domain/type/TransactionType';

describe('PrismaTransactionMapper', () => {
  const mapper = new PrismaTransactionMapper();

  const transactionTypeMappings: {
    domain: TransactionType;
    prisma: $Enums.TransactionType;
  }[] = [
    { domain: TransactionType.BUY, prisma: $Enums.TransactionType.BUY },
    { domain: TransactionType.SELL, prisma: $Enums.TransactionType.SELL },
  ];

  describe('fromDomain', () => {
    it.each(transactionTypeMappings)(
      'should map Transaction to TransactionEntity for %s',
      ({ domain, prisma }) => {
        // Given
        const transaction = new Transaction({
          id: 'transaction-1',
          portfolioId: 'portfolio-1',
          tickerId: 'ticker-1',
          type: domain,
          amount: 1000,
          volume: 10,
          currentTickerPrice: 100,
        });

        // When
        const entity = mapper.fromDomain(transaction);

        // Then
        expect(entity).toEqual({
          id: 'transaction-1',
          portfolioId: 'portfolio-1',
          tickerId: 'ticker-1',
          type: prisma,
          amount: 1000,
          volume: 10,
          currentTickerPrice: 100,
        });
      },
    );
  });

  describe('toDomain', () => {
    it.each(transactionTypeMappings)(
      'should map TransactionEntity to Transaction for %s',
      ({ domain, prisma }) => {
        // Given
        const entity: TransactionEntity = {
          id: 'transaction-1',
          portfolioId: 'portfolio-1',
          tickerId: 'ticker-1',
          type: prisma,
          amount: 1000,
          volume: 10,
          currentTickerPrice: 100,
        };

        // When
        const transaction = mapper.toDomain(entity);

        // Then
        expect(transaction).toBeInstanceOf(Transaction);
        expect(transaction.id).toBe('transaction-1');
        expect(transaction.portfolioId).toBe('portfolio-1');
        expect(transaction.tickerId).toBe('ticker-1');
        expect(transaction.type).toBe(domain);
        expect(transaction.amount).toBe(1000);
        expect(transaction.volume).toBe(10);
        expect(transaction.currentTickerPrice).toBe(100);
      },
    );
  });
});
