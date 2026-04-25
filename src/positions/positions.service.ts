import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { PrismaService } from 'src/lib/prismaService/prisma';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { PaginationDto } from 'src/common';
import { firstValueFrom } from 'rxjs';
import { NATS_SERVICE } from 'src/config';
import { status_position_type } from '@prisma/client';

@Injectable()
export class PositionsService {
  private readonly logger = new Logger('positions service');

  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
    private readonly prisma: PrismaService
  ) {}

  async create(createPositionDto: CreatePositionDto) {
    try {
      return await this.prisma.positions.create({
        data: {
          name: createPositionDto.name,
          base_salary: createPositionDto.base_salary,
          description: createPositionDto.description,
          vacancies: createPositionDto.vacancies,
          id_administrator: createPositionDto.id_administrator,
          id_area: createPositionDto.id_area,
          parent_position_id: createPositionDto.parent_position_id,
          created_at: new Date(),
        },
      });
    } catch (error) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async findAll(paginationDto: PaginationDto) {
    try {
      const total = await this.prisma.positions.count();
      const currentPage = paginationDto.page;
      const perPage = paginationDto.limit;

      return {
        data: await this.prisma.positions.findMany({
          skip: (currentPage - 1) * perPage,
          take: perPage,
        }),
        meta: {
          total,
          page: currentPage,
          lastPage: Math.ceil(total / perPage),
        },
      };
    } catch (error) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async findOne(id: number) {
    try {
      const position = await this.prisma.positions.findUnique({
        where: { id_position: id },
      });

      if (!position) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: `Posición con id ${id} no encontrada`,
        });
      }

      return position;
    } catch (error) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async update(id: number, updatePositionDto: UpdatePositionDto) {
    try {
      await this.findOne(id);

      const { id: _, ...data } = updatePositionDto;

      return await this.prisma.positions.update({
        where: { id_position: id },
        data,
      });
    } catch (error) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async remove(id: number) {
    try {
      const position = await this.findOne(id);

      await this.prisma.positions.update({
        where: {id_position: position.id_position},
        data: {
          status: status_position_type.inactive
        },
      })

      return {
        message: "position deleted successfully",
      }
    } catch (error) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getPositionsTree(){
    try {
      
      const [positions, employees] = await Promise.all([
        this.prisma.positions.findMany({
          include: {
            areas: { 
              select: { 
                name: true, 
                description: true 
              } 
            },
            other_positions: { 
              select: { 
                id_position: true 
              } 
            },
          },
        }),
        firstValueFrom(this.client.send({ cmd: 'findAllEmployees' }, {})),
      ]);

      const employeeByPosition = new Map<number, { photo_url: string; first_name: string; last_name: string }>(
        employees.map((e: { id_position: number; photo_url: string; first_name: string; last_name: string }) => [
          e.id_position,
          { photo_url: e.photo_url, first_name: e.first_name, last_name: e.last_name },
          ]),
        );

      return positions.map((position) => ({
        ...position,
        employee: employeeByPosition.get(position.id_position) ?? null,
        }));

    } catch (error) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}