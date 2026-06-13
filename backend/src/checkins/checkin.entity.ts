import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('checkins')
@Unique(['memberId', 'classId'])
export class CheckInEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  memberId: string;

  @Column()
  classId: string;

  @Column()
  timestamp: string;

  @Column({ default: 'confirmed' })
  status: 'confirmed' | 'registered';
}