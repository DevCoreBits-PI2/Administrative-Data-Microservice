import { Module } from '@nestjs/common';
import { AreasModule } from './areas/areas.module';
import { PositionsModule } from './positions/positions.module';
import { ContractsModule } from './contracts/contracts.module';

@Module({
  imports: [AreasModule, PositionsModule, ContractsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
