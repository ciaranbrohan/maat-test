import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckInEntity } from './checkin.entity';
import { CheckInsController } from './checkins.controller';
import { CheckInsService } from './checkins.service';

@Module({
  imports: [TypeOrmModule.forFeature([CheckInEntity])],
  controllers: [CheckInsController],
  providers: [CheckInsService],
})
export class CheckInsModule {}