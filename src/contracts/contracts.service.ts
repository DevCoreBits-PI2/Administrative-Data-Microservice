import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { NATS_SERVICE } from 'src/config';
import {v2 as cloudinary} from 'cloudinary'
import { PrismaService } from 'src/lib/prismaService/prisma';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { CloudinaryResponse } from 'src/lib/imageProvider/cloudinary-response';
import { CreateContractDto, UpdateContractDto } from './dto';

const streamifier = require('streamifier')

@Injectable()
export class ContractsService {

  private readonly logger = new Logger('contracts service')
  
  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
    private readonly prisma: PrismaService
  ){}

  async uploadFile(file: Express.Multer.File): Promise<CloudinaryResponse>{
    const buffer: Buffer | undefined = Buffer.isBuffer(file) ? file as unknown as Buffer : (file as any)?.buffer;
    if (!buffer) {
      return Promise.reject(new Error('No buffer provided to uploadFile'));
    }

    const publicId = `contract_${Date.now()}`;

    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream =  cloudinary.uploader.upload_stream(
        { resource_type: 'image', public_id: publicId, format: 'pdf' },
        (error, result) => {
          if(error) return reject(error);
          if (!result) return reject(new Error('No upload result from Cloudinary'));
          resolve(result);
        }
      );
      try {
        streamifier.createReadStream(buffer).pipe(uploadStream);
      } catch (err) {
        reject(err);
      }
    })
  }

  async create(createContractDto: CreateContractDto) {
    try {
      
      return await this.prisma.contracts.create({
        data: {
          conditions : createContractDto.conditions,
          status: createContractDto.contractStatus,
          contract_type: createContractDto.contractType,
          start_date: createContractDto.startDate,
          end_date: createContractDto.endDate,
          id_employee: createContractDto.idEmployee,
          id_manager: createContractDto.idManager,
          pdf_document: createContractDto.pdfDocument,
          created_at: new Date()
        }
      })

    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
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
