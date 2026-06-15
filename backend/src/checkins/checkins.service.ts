import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CheckInEntity } from './checkin.entity';
import { CreateCheckInDto } from './dto/create-checkin.dto';

@Injectable()
export class CheckInsService {
  constructor(
    @InjectRepository(CheckInEntity)
    private readonly checkInRepo: Repository<CheckInEntity>,
  ) {}

  findAll(): Promise<CheckInEntity[]> {
    return this.checkInRepo.find();
  }

  async create(dto: CreateCheckInDto): Promise<CheckInEntity> {
    const existing = await this.checkInRepo.findOne({
      where: { memberId: dto.memberId, classId: dto.classId },
    });
    if (existing) return existing;

    return this.checkInRepo.save({
      memberId: dto.memberId,
      classId: dto.classId,
      timestamp: new Date().toISOString(),
      status: 'confirmed',
    });
  }

  async remove(id: string): Promise<void> {
    const existing = await this.checkInRepo.findOne({ where: { id } });
    if (!existing) throw new NotFoundException(`Check-in ${id} not found`);
    await this.checkInRepo.delete(id);
  }
}