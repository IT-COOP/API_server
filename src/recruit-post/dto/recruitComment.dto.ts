import { ApiProperty } from '@nestjs/swagger';

export class RecruitCommentDTO {
  @ApiProperty({
    example: 'ㅋㅋㅋㅋ ㅇㅈ이지 저건',
    description: '댓글 내용',
  })
  public recruitCommentContent: string;

  @ApiProperty({
    example: 2,
    description: '댓글 or 대댓글',
  })
  public commentDepth: number;

  @ApiProperty({
    example: 1,
    description: '1번 댓글의 대댓글이면 댓글 그룹',
  })
  public commentGroup: number;
}
