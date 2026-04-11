import { Module } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { ContractsController } from './contracts.controller';
import { NatsModule } from 'src/transports/nats.module';
import { PrismaService } from 'src/lib/prisma';

@Module({
  controllers: [ContractsController],
  providers: [ContractsService, PrismaService],
  imports: [
    NatsModule
  ]
})
export class ContractsModule {}
