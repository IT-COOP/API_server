import { Controller, Delete, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiParam } from '@nestjs/swagger';
import { RecruitPostService } from './recruit-post.service';

@Controller('recruit')
export class RecruitPostController {
  constructor(private readonly recruitPostService: RecruitPostService) {}

  @ApiParam({
    name: 'recruitPostId',
    required: true,
    description: '포스트 아이디',
  })
  @ApiOperation({ summary: '협업 신청 취소하기' })
  @Delete('/:recruitPostId/:applyId')
  async removeApply(@Param('applyId', ParseIntPipe) applyId: number) {
    this.recruitService.deleteApply(applyId);

    return { success: true };
  }

  @ApiParam({
    name: 'recruitKeepId',
    required: true,
    description: '킵잇 아이디',
  })
  @ApiOperation({ summary: '협업 keep취소하기' })
  @Delete('/:recruitKeepId')
  async removeKeepIt(@Param('recruitKeepId', ParseIntPipe) keepId: number) {
    this.recruitService.deleteKeepIt(keepId);

    return { success: true };
  }

  @ApiParam({
    name: 'recruitCommentId',
    required: true,
    description: '댓글 아이디',
  })
  @ApiOperation({ summary: '협업 댓글 삭제하기' })
  @Delete('/:recruitCommentId')
  async removeComment(
    @Param('recruitCommentId', ParseIntPipe) commentId: number,
  ) {
    this.recruitPostService.deleteComment(commentId);

    return { success: true };
  }
}
