import { Type } from "class-transformer";
import { IsDate, IsEnum, IsNumber, isNumber, IsOptional, IsPositive, IsString } from "class-validator";
import { TypeStatusAreaListDto } from "../enum/status_area.enum";
import { status_area_type } from "@prisma/client";

export class CreateAreaDto{

  @IsString()
  name: string

  @IsString()
  description: string

  @IsNumber()
  @IsPositive()
  id_administrator: number

  @IsEnum(TypeStatusAreaListDto,{
    message: `valid types are: ${TypeStatusAreaListDto}`
  })
  @IsOptional()
  status?: status_area_type
}