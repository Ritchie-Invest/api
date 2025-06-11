import { ApiProperty } from '@nestjs/swagger';
import { GetUnitByIdResponse } from './get-unit-by-id.response';

export class getUnitsByChapterIdResponse {
  @ApiProperty({ type: [GetUnitByIdResponse] })
  units: GetUnitByIdResponse[];

  constructor(units: GetUnitByIdResponse[]) {
    this.units = units;
  }
}
