import { ApiProperty } from '@nestjs/swagger';

export class RecruitApplyDTO {
  @ApiProperty({
    example: '신청합니다',
    description: '신청 메세지',
  })
  public applyMessage: string;

  @ApiProperty({
    example: '200',
    description: '직군에 대한 번호',
  })
  public task: number;
}
