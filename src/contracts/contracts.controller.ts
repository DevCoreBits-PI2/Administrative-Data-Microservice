import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';

@Controller()
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @MessagePattern('createContract')
  create(@Payload() createContractDto: CreateContractDto) {
    return this.contractsService.create(createContractDto);
  }

  @MessagePattern('findAllContracts')
  findAll() {
    return this.contractsService.findAll();
  }

  @MessagePattern('findOneContract')
  findOne(@Payload() id: number) {
    return this.contractsService.findOne(id);
  }

  @MessagePattern('updateContract')
  update(@Payload() updateContractDto: UpdateContractDto) {
    return this.contractsService.update(updateContractDto.id, updateContractDto);
  }

  @MessagePattern('removeContract')
  remove(@Payload() id: number) {
    return this.contractsService.remove(id);
  }
}
