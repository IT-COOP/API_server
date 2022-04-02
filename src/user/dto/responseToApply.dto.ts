import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class ResponseToApplyDto {
  @IsNumber()
  recruitPostId: number;

  @IsString()
  applicant: string;

  @IsBoolean()
  isAccepted: boolean;
}
