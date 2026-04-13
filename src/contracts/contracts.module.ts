import { Module } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { ContractsController } from './contracts.controller';
import { NatsModule } from 'src/transports/nats.module';
import { PrismaService } from 'src/lib/prismaService/prisma';
import { CloudinaryProvider } from 'src/lib/imageProvider/cloudinary.provider';

@Module({
  controllers: [ContractsController],
  providers: [ContractsService, PrismaService, CloudinaryProvider],
  imports: [NatsModule],
})
export class ContractsModule {}
