import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { PrismaService } from 'src/lib/prismaService/prisma';
import { RpcException } from '@nestjs/microservices';
import { CloudinaryResponse } from 'src/lib/imageProvider/cloudinary-response';
import { CreateContractDto, UpdateContractDto } from './dto';
import { PaginationDto } from 'src/common';

const streamifier = require('streamifier');

@Injectable()
export class ContractsService {
  private readonly logger = new Logger('contracts service');

  constructor(private readonly prisma: PrismaService) {}

  async uploadFile(file: Express.Multer.File): Promise<CloudinaryResponse> {
    const buffer: Buffer | undefined = Buffer.isBuffer(file)
      ? (file as unknown as Buffer)
      : (file as any)?.buffer;
    if (!buffer) {
      return Promise.reject(new Error('No buffer provided to uploadFile'));
    }

    const publicId = `contract_${Date.now()}`;

    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'image', public_id: publicId, format: 'pdf' },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('No upload result from Cloudinary'));
          resolve(result);
        },
      );
      try {
        streamifier.createReadStream(buffer).pipe(uploadStream);
      } catch (err) {
        reject(err);
      }
    });
  }

  async create(createContractDto: CreateContractDto) {
    try {
      return await this.prisma.contracts.create({
        data: {
          conditions: createContractDto.conditions,
          status: createContractDto.contractStatus,
          contract_type: createContractDto.contractType,
          start_date: createContractDto.startDate,
          end_date: createContractDto.endDate,
          id_employee: createContractDto.idEmployee,
          id_manager: createContractDto.idManager,
          pdf_document: createContractDto.pdfDocument,
          public_id: createContractDto.publicId,
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
      const total = await this.prisma.contracts.count();
      const currentPage = paginationDto.page;
      const perPage = paginationDto.limit;

      return {
        data: await this.prisma.contracts.findMany({
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
      const contract = await this.prisma.contracts.findUnique({
        where: { id_contract: id },
      });

      if (!contract) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: `Contrato con id ${id} no encontrado`,
        });
      }

      return contract;
    } catch (error) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async update(id: number, updateContractDto: UpdateContractDto) {
    try {
      await this.findOne(id);

      const { id: _, pdfDocument, contractStatus, contractType, startDate, endDate, idEmployee, idManager, conditions } = updateContractDto;

      return await this.prisma.contracts.update({
        where: { id_contract: id },
        data: {
          ...(conditions && { conditions }),
          ...(contractStatus && { status: contractStatus }),
          ...(contractType && { contract_type: contractType }),
          ...(startDate && { start_date: startDate }),
          ...(endDate && { end_date: endDate }),
          ...(pdfDocument && { pdf_document: pdfDocument }),
          ...(idEmployee && { id_employee: idEmployee }),
          ...(idManager && { id_manager: idManager }),
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

  async remove(id: number) {
    try {
      const contract = await this.findOne(id);

      cloudinary.uploader.destroy(contract.public_id)
      .catch(error => {
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: `something went wrong deleting the file from cloudinary: ${error.message}` 
        })
      })

      await this.prisma.contracts.delete({
        where: { id_contract: id },
      });
    
      return {
        message: "contract deleted successfully"
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
