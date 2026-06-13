import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberEntity } from './members/member.entity';
import { ClassEntity } from './classes/class.entity';
import { CheckInEntity } from './checkins/checkin.entity';
import { MembersModule } from './members/members.module';
import { ClassesModule } from './classes/classes.module';
import { CheckInsModule } from './checkins/checkins.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432'),
      username: process.env.DB_USER ?? 'postgres',
      password: process.env.DB_PASS ?? 'postgres',
      database: process.env.DB_NAME ?? 'maat_kiosk',
      entities: [MemberEntity, ClassEntity, CheckInEntity],
      synchronize: true,
    }),
    MembersModule,
    ClassesModule,
    CheckInsModule,
    SeedModule,
  ],
})
export class AppModule {}
