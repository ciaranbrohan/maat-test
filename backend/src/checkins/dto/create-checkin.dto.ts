import { IsString } from 'class-validator';

export class CreateCheckInDto {
  @IsString()
  memberId: string;

  @IsString()
  classId: string;
}