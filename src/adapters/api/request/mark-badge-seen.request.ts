import { ApiProperty } from '@nestjs/swagger';
import { BadgeType } from '../../../core/domain/type/BadgeType';
import { IsEnum } from 'class-validator';

export class MarkBadgeSeenRequest {
  @ApiProperty({ enum: BadgeType })
  @IsEnum(BadgeType)
  type!: BadgeType;
}
