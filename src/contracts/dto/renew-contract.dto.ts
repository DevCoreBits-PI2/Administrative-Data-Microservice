import { IsDate, IsNumber, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class RenewContractDto {
  @IsNumber()
  @IsPositive()
  id: number;

  @Type(() => Date)
  @IsDate()
  newEndDate: Date;
}
