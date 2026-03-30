import { Module } from '@nestjs/common';
import { AdministrativeDataService } from './administrative-data.service';
import { AdministrativeDataController } from './administrative-data.controller';
import { NatsModule } from 'src/transports/nats.module';
import { PrismaService } from 'src/lib/prisma';

@Module({
  controllers: [AdministrativeDataController],
  providers: [AdministrativeDataService, PrismaService],
  imports:[
    NatsModule,
  ]
})
export class AdministrativeDataModule {}
