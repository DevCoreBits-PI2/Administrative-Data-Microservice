import { PartialType } from '@nestjs/mapped-types';
import { CreatePositionDto } from './create-position.dto';
import { IsNumber, IsPositive } from 'class-validator';

export class UpdatePositionDto extends PartialType(CreatePositionDto) {
  @IsNumber()
  @IsPositive()
  id: number;
}
