import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AdministrativeDataService } from './administrative-data.service';
import { CreateAdministrativeDatumDto } from './dto/create-administrative-datum.dto';
import { UpdateAdministrativeDatumDto } from './dto/update-administrative-datum.dto';

@Controller()
export class AdministrativeDataController {
  constructor(private readonly administrativeDataService: AdministrativeDataService) {}

  @MessagePattern('createAdministrativeDatum')
  create(@Payload() createAdministrativeDatumDto: CreateAdministrativeDatumDto) {
    return this.administrativeDataService.create(createAdministrativeDatumDto);
  }

  @MessagePattern('findAllAdministrativeData')
  findAll() {
    return this.administrativeDataService.findAll();
  }

  @MessagePattern('findOneAdministrativeDatum')
  findOne(@Payload() id: number) {
    return this.administrativeDataService.findOne(id);
  }

  @MessagePattern('updateAdministrativeDatum')
  update(@Payload() updateAdministrativeDatumDto: UpdateAdministrativeDatumDto) {
    return this.administrativeDataService.update(updateAdministrativeDatumDto.id, updateAdministrativeDatumDto);
  }

  @MessagePattern('removeAdministrativeDatum')
  remove(@Payload() id: number) {
    return this.administrativeDataService.remove(id);
  }
}
