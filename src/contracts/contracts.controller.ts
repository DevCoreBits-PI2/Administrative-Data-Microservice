import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ContractsService } from './contracts.service';
import { CreateContractDto, CreateContractWithPdfDto, UpdateContractDto } from './dto';

@Controller()
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @MessagePattern({cmd:'createContract'})
  async createContract(
    @Payload() payload: CreateContractWithPdfDto,
  ) {
    const buffer = Buffer.from(payload.bufferBase64, 'base64');

    const file = {
      fieldname: payload.fieldname || 'file',
      originalname: payload.originalname,
      encoding: payload.encoding || '7bit',
      mimetype: payload.mimetype,
      size: buffer.length,
      buffer,
    } as Express.Multer.File;

    const uploadedPdf = await this.contractsService.uploadFile(file);

    const contractData: CreateContractDto = {
      conditions: payload.conditions,
      contractStatus: payload.contractStatus,
      contractType: payload.contractType,
      startDate: payload.startDate,
      endDate: payload.endDate,
      pdfDocument: uploadedPdf.secure_url,
      idEmployee: payload.idEmployee,
      idManager: payload.idManager,
    };

    return this.contractsService.create(contractData);
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
