import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config';
import { CreateAreaDto, CreatePositionDto } from './dto';
import { PrismaService } from 'src/lib/prisma';

@Injectable()
export class AdministrativeDataService {

  private readonly logger = new Logger("administrative-data-service")

  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
    private readonly prisma: PrismaService
  ){}

  //---- businness logic for areas -------
  async createArea(createAreaDto: CreateAreaDto){
    try {
      await this.prisma.areas.create({
        data:{
          name: createAreaDto.name,
          description: createAreaDto.description,
          id_administrator: createAreaDto.id_administrator,
          created_at: new Date()
        }
      })
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.message
      })
    }
  }

  //---- businness logic for positions -------
  createPosition(createPositionDto: CreatePositionDto) {
    return 'This action adds a new administrativeDatum';
  }

  findAll() {
    return `This action returns all administrativeData`;
  }



  //---- businness logic for contracts -------
}
