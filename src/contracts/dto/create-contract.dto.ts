import {IsDate, IsEnum, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";
import { StatusContractListDto } from "../enum/contract_status.enum";
import { Type } from "class-transformer";
import { contract_status_enum, contract_type_enum } from "@prisma/client";
import { TypeContractListDto } from "../enum/contract_type.enum";

export class CreateContractDto{
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

  @IsString()
  pdfDocument: string

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  idEmployee: number

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  idManager: number

  @IsString()
  publicId: string
}