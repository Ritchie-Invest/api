import { Injectable } from '@nestjs/common';
import { EntityMapper } from '../../../core/base/entity-mapper';
import { DailyBar } from '../../../core/domain/model/DailyBar';
import { DailyBar as DailyBarEntity } from '@prisma/client';

@Injectable()
export class PrismaDailyBarMapper
  implements EntityMapper<DailyBar, DailyBarEntity>
{
  fromDomain(model: DailyBar): DailyBarEntity {
    return {
      id: model.id,
      tickerId: model.tickerId,
      date: model.timestamp,
      open: model.open,
      high: model.high,
      low: model.low,
      close: model.close,
      volume: model.volume,
    };
  }

  toDomain(entity: DailyBarEntity): DailyBar {
    return new DailyBar({
      id: entity.id,
      tickerId: entity.tickerId,
      timestamp: entity.date,
      open: entity.open,
      high: entity.high,
      low: entity.low,
      close: entity.close,
      volume: entity.volume,
    });
  }
}
