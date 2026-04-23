import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreatePositionDto {
  @IsString()
  name: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  base_salary?: number;

  @IsString()
  description: string;

  @IsNumber()
  @IsPositive()
  id_administrator: number;

  @IsNumber()
  @IsPositive()
  id_area: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  parent_position_id?: number;
}
