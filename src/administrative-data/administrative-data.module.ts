import { Module } from '@nestjs/common';
import { AdministrativeDataService } from './administrative-data.service';
import { AdministrativeDataController } from './administrative-data.controller';
import { NatsModule } from 'src/transports/nats.module';

@Module({
  controllers: [AdministrativeDataController],
  providers: [AdministrativeDataService],
  imports:[
    NatsModule
  ]
})
export class AdministrativeDataModule {}
