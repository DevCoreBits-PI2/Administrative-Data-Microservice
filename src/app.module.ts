import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdministrativeDataModule } from './administrative-data/administrative-data.module';

@Module({
  imports: [AdministrativeDataModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
