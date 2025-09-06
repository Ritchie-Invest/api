import { PrismaTransactionMapper } from '../prisma-transaction.mapper';
import { Transaction } from '../../../../core/domain/model/Transaction';
import { Transaction as TransactionEntity, $Enums } from '@prisma/client';
import { TransactionType } from '../../../../core/domain/type/TransactionType';

describe('PrismaTransactionMapper', () => {
  const mapper = new PrismaTransactionMapper();

  const transactionTypeMappings: { domain: TransactionType; prisma: $Enums.TransactionType }[] = [
    { domain: TransactionType.Buy, prisma: $Enums.TransactionType.Buy },
    { domain: TransactionType.Sell, prisma: $Enums.TransactionType.Sell },
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
          value: 1000,
        });

        // When
        const entity = mapper.fromDomain(transaction);

        // Then
        expect(entity).toEqual({
          id: 'transaction-1',
          portfolioId: 'portfolio-1',
          tickerId: 'ticker-1',
          type: prisma,
          value: 1000,
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
          value: 1000,
        };

        // When
        const transaction = mapper.toDomain(entity);

        // Then
        expect(transaction).toBeInstanceOf(Transaction);
        expect(transaction.id).toBe('transaction-1');
        expect(transaction.portfolioId).toBe('portfolio-1');
        expect(transaction.tickerId).toBe('ticker-1');
        expect(transaction.type).toBe(domain);
        expect(transaction.value).toBe(1000);
      },
    );
  });
});