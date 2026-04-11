import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { NATS_SERVICE } from 'src/config';
import { PrismaService } from 'src/lib/prisma';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class ContractsService {

  private readonly logger = new Logger('contracts service')
  
  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
    private readonly prisma: PrismaService
  ){}

  create(createContractDto: CreateContractDto) {
    return 'This action adds a new contract';
  }

  findAll() {
    return `This action returns all contracts`;
  }

  findOne(id: number) {
    return `This action returns a #${id} contract`;
  }

  update(id: number, updateContractDto: UpdateContractDto) {
    return `This action updates a #${id} contract`;
  }

  remove(id: number) {
    return `This action removes a #${id} contract`;
  }
}
