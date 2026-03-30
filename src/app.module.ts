import { Module } from '@nestjs/common';
import { AdministrativeDataModule } from './administrative-data/administrative-data.module';

@Module({
  imports: [AdministrativeDataModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
