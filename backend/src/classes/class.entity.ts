import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('classes')
export class ClassEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  instructorName: string;

  @Column()
  day: string;

  @Column()
  time: string;

  @Column()
  repeat: string;

  @Column()
  duration: number;

  @Column()
  capacity: number;
}