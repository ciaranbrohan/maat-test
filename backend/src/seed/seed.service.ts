import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MemberEntity } from '../members/member.entity';
import { ClassEntity } from '../classes/class.entity';
import membersData from '../../data/members.json';
import classesData from '../../data/classes.json';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(MemberEntity)
    private readonly memberRepo: Repository<MemberEntity>,
    @InjectRepository(ClassEntity)
    private readonly classRepo: Repository<ClassEntity>,
  ) {}

  async onModuleInit() {
    const memberCount = await this.memberRepo.count();
    if (memberCount > 0) {
      this.logger.log('Database already seeded — skipping');
      return;
    }

    await this.memberRepo.save(membersData as MemberEntity[]);
    await this.classRepo.save(classesData as ClassEntity[]);
    this.logger.log(`Seeded ${membersData.length} members and ${classesData.length} classes`);
  }
}
