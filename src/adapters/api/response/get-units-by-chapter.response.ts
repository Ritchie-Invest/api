import { ApiProperty } from '@nestjs/swagger';
import { GetUnitByIdResponse } from './get-unit-by-id.response';

export class GetUnitsByChapterIdResponse {
  @ApiProperty({ type: [GetUnitByIdResponse] })
  units: GetUnitByIdResponse[];

  constructor(units: GetUnitByIdResponse[]) {
    this.units = units;
  }
}
