import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { RecruitPostService } from './recruit-post.service';

@Controller('recruit')
export class RecruitPostController {
  constructor(private readonly recruitPostService: RecruitPostService) {}

  @ApiQuery({
    name: 'task',
    required: false,
    description: 'task',
  })
  @ApiQuery({
    name: 'order',
    required: false,
    description: 'order',
  })
  @ApiQuery({
    name: 'items',
    required: true,
    description: 'items',
  })
  @ApiQuery({
    name: 'stack',
    required: false,
    description: 'stack',
  })
  @ApiQuery({
    name: 'lastId',
    required: false,
    description: 'lastId',
  })
  @Get()
  @ApiOperation({ summary: '협업 게시물 전체 불러오기' })
  async getAllRecruits(@Query() query: any) {
    // const userId = 'cgh';

    query;
    // const order = query.order;
    // const items = query.items ? query.items : 12;
    // const location = query.location;
    // const task = query.task;
    // const stack = query.stack;
    // const lastId = query.lastId;

    console.log('서비스 전');

    const recruits = await this.recruitPostService
      .ReadAllRecruits
      // userId,
      // order,
      // items,
      // location,
      // task,
      // stack,
      // lastId,
      ();

    const post = recruits.map((item: any) => {
      const obj: any = item;
      obj.recruitDurationWeeks = item.recruitDurationDays / 7;
      return obj;
    });

    return post;
  }

  @ApiParam({
    name: 'recruitPostId',
    required: true,
    description: '상세 협업 게시물',
  })
  @Get('/:recruitPostId')
  @ApiOperation({ summary: '협업 상세 게시물 불러오기' })
  async getDetailRecruit(
    @Param('recruitPostId', ParseIntPipe) recruitPostId: number,
  ) {
    console.log(' 컨트롤러 도착 서비스 전');

    const details: any = await this.recruitPostService.ReadSpecificRecruits(
      recruitPostId,
    );

    details.recruitDurationWeeks = details.recruitDurationDays / 7;
    return details;
  }

  @ApiParam({
    name: 'recruitPostId',
    required: true,
    description: '포스트 아이디',
  })
  @ApiOperation({ summary: '협업 신청 취소하기' })
  @Delete('/:recruitPostId/:applyId')
  async removeApply(@Param('applyId', ParseIntPipe) applyId: number) {
    this.recruitPostService.deleteApply(applyId);

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
    this.recruitPostService.deleteKeepIt(keepId);

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
