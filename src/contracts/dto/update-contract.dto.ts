import { PartialType } from '@nestjs/mapped-types';
import { CreateContractDto } from './create-contract.dto';
import { IsNumber, IsPositive } from 'class-validator';


export class UpdateContractDto extends PartialType(CreateContractDto) {
  @IsNumber()
  @IsPositive()
  id: number;
}
