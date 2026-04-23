import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { PrismaService } from 'src/lib/prismaService/prisma';
import { RpcException } from '@nestjs/microservices';
import { PaginationDto } from 'src/common';

@Injectable()
export class PositionsService {
  private readonly logger = new Logger('positions service');

  constructor(private readonly prisma: PrismaService) {}

  async create(createPositionDto: CreatePositionDto) {
    try {
      return await this.prisma.positions.create({
        data: {
          name: createPositionDto.name,
          base_salary: createPositionDto.base_salary,
          description: createPositionDto.description,
          id_administrator: createPositionDto.id_administrator,
          id_area: createPositionDto.id_area,
          parent_position_id: createPositionDto.parent_position_id,
          created_at: new Date(),
        },
      });
    } catch (error) {
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
      await this.findOne(id);

      await this.prisma.positions.delete({
        where: { id_position: id },
      });

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
}
