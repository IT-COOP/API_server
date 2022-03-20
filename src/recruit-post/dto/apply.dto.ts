import { ApiProperty } from '@nestjs/swagger';

export class RecruitApplyDTO {
  @ApiProperty({
    example: '신청합니다',
    description: '신청 메세지',
  })
  public applyMessage: string;

  @ApiProperty({
    example: '1',
    description: '1번 댓글의 대댓글이면 댓글 그룹',
  })
  public task: number;
}
