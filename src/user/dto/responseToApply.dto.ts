import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class ResponseToApplyDto {
  @IsNumber()
  @ApiProperty({
    description: '신청된 게시글 ID',
  })
  recruitPostId: number;

  @IsString()
  @ApiProperty({
    description: '신청한 사람 userId',
  })
  applicant: string;

  @IsBoolean()
  @ApiProperty({
    description: '수락 및 거절',
  })
  isAccepted: boolean;
}
