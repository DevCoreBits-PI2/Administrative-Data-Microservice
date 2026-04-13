import { IsBase64, IsDate, IsEnum, IsMimeType, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";
import { StatusContractListDto } from "../enum/contract_status.enum";
import { Type } from "class-transformer";
import { contract_status_enum, contract_type_enum } from "@prisma/client";
import { TypeContractListDto } from "../enum/contract_type.enum";

export class CreateContractWithPdfDto {

  @IsString()
  conditions: string

  @IsEnum(StatusContractListDto, {
    message: `valid status are: ${StatusContractListDto}`
  })
  @IsOptional()
  contractStatus?: contract_status_enum


  @IsEnum(TypeContractListDto, {
    message: `valid types are: ${TypeContractListDto}`
  })
  contractType: contract_type_enum

  @Type(() => Date)
  @IsDate()
  startDate: Date 

  @Type(() => Date)
  @IsDate()
  endDate: Date

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  idEmployee: number

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  idManager: number

  @IsBase64()
  bufferBase64: string;

  @IsMimeType()
  mimetype: string;

  @IsString()
  originalname: string;

  @IsOptional()
  @IsString()
  fieldname?: string;

  @IsOptional()
  @IsString()
  encoding?: string;
}
