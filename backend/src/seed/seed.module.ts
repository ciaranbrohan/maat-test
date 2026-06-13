import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberEntity } from '../members/member.entity';
import { ClassEntity } from '../classes/class.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([MemberEntity, ClassEntity])],
  providers: [SeedService],
})
export class SeedModule {}
