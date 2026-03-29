import { Injectable } from '@nestjs/common';
import { CreateAdministrativeDatumDto } from './dto/create-administrative-datum.dto';
import { UpdateAdministrativeDatumDto } from './dto/update-administrative-datum.dto';

@Injectable()
export class AdministrativeDataService {
  create(createAdministrativeDatumDto: CreateAdministrativeDatumDto) {
    return 'This action adds a new administrativeDatum';
  }

  findAll() {
    return `This action returns all administrativeData`;
  }

  findOne(id: number) {
    return `This action returns a #${id} administrativeDatum`;
  }

  update(id: number, updateAdministrativeDatumDto: UpdateAdministrativeDatumDto) {
    return `This action updates a #${id} administrativeDatum`;
  }

  remove(id: number) {
    return `This action removes a #${id} administrativeDatum`;
  }
}
