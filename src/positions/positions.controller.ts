import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PositionsService } from './positions.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';

@Controller()
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  @MessagePattern('createPosition')
  create(@Payload() createPositionDto: CreatePositionDto) {
    return this.positionsService.create(createPositionDto);
  }

  @MessagePattern('findAllPositions')
  findAll() {
    return this.positionsService.findAll();
  }

  @MessagePattern('findOnePosition')
  findOne(@Payload() id: number) {
    return this.positionsService.findOne(id);
  }

  @MessagePattern('updatePosition')
  update(@Payload() updatePositionDto: UpdatePositionDto) {
    return this.positionsService.update(updatePositionDto.id, updatePositionDto);
  }

  @MessagePattern('removePosition')
  remove(@Payload() id: number) {
    return this.positionsService.remove(id);
  }
}
