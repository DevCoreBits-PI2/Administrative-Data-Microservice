import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import { NATS_SERVICE } from 'src/config';
import { PrismaService } from 'src/lib/prisma';
import { ClientProxy, RpcException } from '@nestjs/microservices';

@Injectable()
export class AreasService {

  private readonly logger = new Logger('areas service')
  
  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
    private readonly prisma: PrismaService
  ){}

  async create(createAreaDto: CreateAreaDto) {
    try {
      return await this.prisma.areas.create({
        data:{
          name: createAreaDto.name,
          description: createAreaDto.description,
          id_administrator: createAreaDto.id_administrator,
          created_at: new Date()
        }
      })
    } catch (error: any) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.message
      })
    }
  }

  findAll() {
    return `This action returns all areas`;
  }

  findOne(id: number) {
    return `This action returns a #${id} area`;
  }

  update(id: number, updateAreaDto: UpdateAreaDto) {
    return `This action updates a #${id} area`;
  }

  remove(id: number) {
    return `This action removes a #${id} area`;
  }
}
