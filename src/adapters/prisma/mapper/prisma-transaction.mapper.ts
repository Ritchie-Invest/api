import { EntityMapper } from '../../../core/base/entity-mapper';
import { Transaction } from '../../../core/domain/model/Transaction';
import { Transaction as TransactionEntity } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { TransactionType } from '../../../core/domain/type/TransactionType';

@Injectable()
export class PrismaTransactionMapper
  implements EntityMapper<Transaction, TransactionEntity>
{
  fromDomain(model: Transaction): TransactionEntity {
    return {
      id: model.id,
      portfolioId: model.portfolioId,
      tickerId: model.tickerId,
      type: model.type,
      amount: model.amount,
      volume: model.volume,
      currentTickerPrice: model.currentTickerPrice,
      timestamp: model.timestamp,
    };
  }

  toDomain(entity: TransactionEntity): Transaction {
    return new Transaction({
      id: entity.id,
      portfolioId: entity.portfolioId,
      tickerId: entity.tickerId,
      type: entity.type as TransactionType,
      amount: entity.amount,
      volume: entity.volume,
      currentTickerPrice: entity.currentTickerPrice,
      timestamp: entity.timestamp,
    });
  }
}
