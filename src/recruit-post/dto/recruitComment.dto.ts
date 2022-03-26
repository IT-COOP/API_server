import { ApiProperty } from '@nestjs/swagger';

export class RecruitCommentDTO {
  @ApiProperty({
    example: 'ㅋㅋㅋㅋ ㅇㅈ이지 저건',
    description: '댓글 내용',
  })
  public recruitCommentContent: string;

  @ApiProperty({
    example: 0,
    description: '댓글이면 0 대댓글이면 1',
  })
  public commentDepth: number;

  @ApiProperty({
    example: 1,
    description: '1번 댓글의 대댓글이면 댓글 그룹',
  })
  public commentGroup: number;
}
