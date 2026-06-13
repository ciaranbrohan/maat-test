import { Column, Entity, PrimaryColumn} from 'typeorm';

@Entity('members')
export class MemberEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  profilePicture: string;
}