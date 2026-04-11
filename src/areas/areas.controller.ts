import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AreasService } from './areas.service';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';

@Controller()
export class AreasController {
  constructor(private readonly areasService: AreasService) {}

  @MessagePattern('createArea')
  create(@Payload() createAreaDto: CreateAreaDto) {
    return this.areasService.create(createAreaDto);
  }

  @MessagePattern('findAllAreas')
  findAll() {
    return this.areasService.findAll();
  }

  @MessagePattern('findOneArea')
  findOne(@Payload() id: number) {
    return this.areasService.findOne(id);
  }

  @MessagePattern('updateArea')
  update(@Payload() updateAreaDto: UpdateAreaDto) {
    return this.areasService.update(updateAreaDto.id, updateAreaDto);
  }

  @MessagePattern('removeArea')
  remove(@Payload() id: number) {
    return this.areasService.remove(id);
  }
}
