import { PartialType } from '@nestjs/mapped-types';
import { CreateAreaDto } from './create-area.dto';
import { IsNumber, IsPositive } from 'class-validator';

export class UpdateAreaDto extends PartialType(CreateAreaDto) {

  @IsNumber()
  @IsPositive()
  id: number;
}
