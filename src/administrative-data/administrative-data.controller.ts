import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AdministrativeDataService } from './administrative-data.service';
import { CreateAreaDto, CreatePositionDto } from './dto';

@Controller()
export class AdministrativeDataController {
  constructor(private readonly administrativeDataService: AdministrativeDataService) {}

  //------ AREAS -----------
  @MessagePattern({cmd:'createArea'})
  createArea(@Payload() createAreaDto: CreateAreaDto){
    return this.administrativeDataService.createArea(createAreaDto);
  }

  
  //------ POSITIONS ---------
  @MessagePattern({cmd:'createPosition'})
  create(@Payload() createPositionDto: CreatePositionDto) {
    return this.administrativeDataService.createPosition(createPositionDto);
  }

  @MessagePattern({cmd:'findAllAdministrativeData'})
  findAll() {
    return this.administrativeDataService.findAll();
  }

  //------ CONTRACTS --------
}
