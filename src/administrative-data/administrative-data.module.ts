import { Module } from '@nestjs/common';
import { AdministrativeDataService } from './administrative-data.service';
import { AdministrativeDataController } from './administrative-data.controller';

@Module({
  controllers: [AdministrativeDataController],
  providers: [AdministrativeDataService],
})
export class AdministrativeDataModule {}
