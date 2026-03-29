import { PartialType } from '@nestjs/mapped-types';
import { CreateAdministrativeDatumDto } from './create-administrative-datum.dto';

export class UpdateAdministrativeDatumDto extends PartialType(CreateAdministrativeDatumDto) {
  id: number;
}
