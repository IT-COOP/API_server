import { LooseGuard, StrictGuard } from './../auth/auth.guard';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';

import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RecruitApplyDTO } from './dto/apply.dto';
import { RecruitCommentDTO } from './dto/recruitComment.dto';
import { recruitPostDTO } from './dto/recruitPost.dto';
import { RecruitApplies } from './entities/RecruitApplies';
import { RecruitComments } from './entities/RecruitComments';
import { RecruitKeeps } from './entities/RecruitKeeps';
import { RecruitPosts } from './entities/RecruitPosts';
import { RecruitStacks } from './entities/RecruitStacks';
import { RecruitTasks } from './entities/RecruitTasks';
import { RecruitPostService } from './recruit-post.service';
import { Response } from 'express';

@ApiTags('프로젝트 게시판')
@Controller('recruit')
export class RecruitPostController {
  constructor(private readonly recruitPostService: RecruitPostService) {}

  @ApiQuery({
    name: 'task',
    required: false,
    description: 'task',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'order',
  })
  @ApiQuery({
    name: 'items',
    required: false,
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
  @UseGuards(LooseGuard)
  @Get()
  @ApiOperation({ summary: '협업 게시물 전체 불러오기' })
  async getAllRecruits(@Query() query: any, @Res() res: Response) {
    const { userId } = res.locals.user;

    const id = userId ? userId : '';
    const order = query.sort ? query.sort : 0;
    const items = query.items ? query.items : 12;
    const location = query.loc ? query.loc : null;
    const task = query.task ? query.task : null;
    const stack = query.stack ? query.stack : null;
    const lastId = query.lastId ? query.lastId : null;

    try {
      const recruits = await this.recruitPostService.ReadAllRecruits(
        id,
        order,
        items,
        location,
        task,
        stack,
        lastId,
      );
      const post = recruits.map((item: any) => {
        const obj: any = item;
        obj.recruitDurationWeeks = item.recruitDurationDays / 7;
        return obj;
      });

      return post;
    } catch (e) {
      return new HttpException('db불러오기 실패', 500);
    }
  }

  @ApiParam({
    name: 'recruitPostId',
    required: true,
    description: '상세 협업 게시물',
  })
  @UseGuards(LooseGuard)
  @Get('/:recruitPostId')
  @ApiOperation({ summary: '협업 상세 게시물 불러오기' })
  async getDetailRecruit(
    @Res() res: any,
    @Param('recruitPostId', ParseIntPipe) recruitPostId: number,
  ) {
    const details: any = await this.recruitPostService.ReadSpecificRecruits(
      recruitPostId,
    );

    details.recruitDurationWeeks = details.recruitDurationDays / 7;
    return details;
  }

  @ApiParam({
    name: 'recruitPostId',
    required: true,
    description: '상세 협업 게시물 아이디',
  })
  @UseGuards(StrictGuard)
  @Post()
  @ApiOperation({ summary: '협업 게시물 쓰기' })
  async postRecruit(@Res() res: Response, @Body() body: recruitPostDTO) {
    const { userId } = res.locals.user;
    const recruitPost = new RecruitPosts();
    recruitPost.author = userId;
    recruitPost.title = body.title;
    recruitPost.recruitContent = body.recruitContent;
    recruitPost.recruitLocation = body.recruitLocation;
    recruitPost.recruitDurationDays = body.recruitDurationWeek * 7;
    recruitPost.thumbImgUrl = body.imgUrl;
    recruitPost.recruitKeepCount = 0;
    recruitPost.viewCount = 0;
    recruitPost.recruitCommentCount = 0;

    const {
      recruitTasks,
      recruitStacks,
    }: { recruitTasks: RecruitTasks[]; recruitStacks: RecruitStacks[] } = body;

    await this.recruitPostService.createRecruit(
      recruitPost,
      recruitStacks,
      recruitTasks,
    );

    return { success: true };
  }

  @ApiParam({
    name: 'recruitPostId',
    required: true,
    description: '상세 협업 게시물 아이디',
  })
  @ApiOperation({ summary: '협업 게시물 수정' })
  @UseGuards(StrictGuard)
  @Put('/:recruitPostId')
  modifyRecruit(
    @Param('recruitPostId', ParseIntPipe) recruitPostId,
    @Res() res: Response,
    @Body() body: recruitPostDTO,
  ) {
    const { userId } = res.locals.user;
    const recruitPost = new RecruitPosts();
    recruitPost.author = userId;
    recruitPost.title = body.title;
    recruitPost.recruitLocation = body.recruitLocation;
    recruitPost.recruitContent = body.recruitContent;
    recruitPost.recruitDurationDays = body.recruitDurationWeek * 7;
    recruitPost.thumbImgUrl = body.imgUrl;

    const recruitStacks = body.recruitStacks;
    const recruitTasks = body.recruitTasks;

    this.recruitPostService.updateRecruitPost(
      recruitPost,
      recruitStacks,
      recruitTasks,
    );
  }

  @ApiParam({
    name: 'recruitPostId',
    required: true,
    description: '댓글 쓰기',
  })
  @ApiOperation({ summary: '협업 댓글 쓰기' })
  @UseGuards(StrictGuard)
  @Post('/:recruitPostId/comment')
  async postComment(
    @Param('recruitPostId', ParseIntPipe) recruitPostId,
    @Res() res: Response,
    @Body() body: RecruitCommentDTO,
  ) {
    const { userId } = res.locals.user;
    const comment = new RecruitComments();
    comment.userId = userId;
    comment.recruitPostId = recruitPostId;
    comment.commentDepth = body.commentDepth;
    comment.commentGroup = body.commentGroup;
    comment.recruitCommentContent = body.recruitCommentContent;

    await this.recruitPostService.createComment(recruitPostId, comment);

    return { success: true };
  }

  @ApiParam({
    name: 'recruitPostId',
    required: true,
    description: '협업 게시물 아이디',
  })
  @ApiParam({
    name: 'recruitCommentId',
    required: true,
    description: '댓글 아이디',
  })
  @UseGuards(StrictGuard)
  @Put('/:recruitPostId/comment/:recruitCommentId')
  @ApiOperation({ summary: '협업 댓글 수정하기' })
  async modifyComment(
    @Param('recruitPostId', ParseIntPipe) recruitPostId,
    @Param('recruitCommentId', ParseIntPipe) recruitCommentId,
    @Res() res: Response,
    @Body() body: RecruitCommentDTO,
  ) {
    const { userId } = res.locals.user;

    const comment = new RecruitComments();
    comment.userId = userId;
    comment.commentDepth = body.commentDepth;
    comment.commentGroup = body.commentGroup;
    comment.recruitCommentContent = body.recruitCommentContent;

    await this.recruitPostService.updateComment(recruitCommentId, comment);

    return { success: true };
  }

  @ApiParam({
    name: 'recruitPostId',
    required: true,
    description: '포스트 아이디',
  })
  @ApiOperation({ summary: '협업 신청하기' })
  @UseGuards(StrictGuard)
  @Post('/:recruitPostId/apply')
  async postApply(
    @Param('recruitPostId', ParseIntPipe) postId: number,
    @Res() res: Response,
    @Body() body: RecruitApplyDTO,
  ) {
    const { userId } = res.locals.user;
    const apply = new RecruitApplies();
    apply.applicant = userId;
    apply.recruitPostId = postId;
    apply.applyMessage = body.applyMessage;
    apply.task = body.task;
    apply.isAccepted = false;

    await this.recruitPostService.createApply(postId, apply);

    return { success: true };
  }

  @ApiParam({
    name: 'recruitPostId',
    required: true,
    description: '포스트 아이디',
  })
  @ApiOperation({ summary: '협업 keep하기' })
  @UseGuards(StrictGuard)
  @Post('/:recruitPostId/keepIt')
  async postKeepIt(
    @Param('recruitPostId', ParseIntPipe) postId: number,
    @Res() res: Response,
  ) {
    const { userId } = res.locals.user;
    const recruitKeepIt = new RecruitKeeps();
    recruitKeepIt.userId = userId;
    recruitKeepIt.recruitPostId = postId;

    this.recruitPostService.createKeepIt(postId, recruitKeepIt);

    return { success: true };
  }

  @ApiParam({
    name: 'recruitPostId',
    required: true,
    description: '포스트 아이디',
  })
  @ApiParam({
    name: 'recruitCommentId',
    required: true,
    description: '댓글 아이디',
  })
  @ApiOperation({ summary: '협업 댓글 삭제하기' })
  @Delete('/:recruitPostId/:recruitCommentId')
  async removeComment(
    @Param('recruitCommentId', ParseIntPipe) commentId: number,
    @Param('recruitPostId', ParseIntPipe) postId: number,
  ) {
    this.recruitPostService.deleteComment(postId, commentId);
    return { success: true };
  }

  @ApiParam({
    name: 'recruitPostId',
    required: true,
    description: '포스트 아이디',
  })
  @ApiParam({
    name: 'applyId',
    required: true,
    description: '협업 신청 아이디',
  })
  @ApiOperation({ summary: '협업 신청 취소하기' })
  @UseGuards(StrictGuard)
  @Delete('/:recruitPostId/:applyId')
  async removeApply(
    @Param('applyId', ParseIntPipe) applyId: number,
    @Param('recruitPostId', ParseIntPipe) postId: number,
    @Res() res: Response,
  ) {
    const { userId } = res.locals.user;
    userId;
    this.recruitPostService.deleteApply(postId, applyId);

    return { success: true };
  }

  @ApiParam({
    name: 'recruitPostId',
    required: true,
    description: '포스트 아이디',
  })
  @ApiParam({
    name: 'recruitKeepId',
    required: true,
    description: '킵잇 아이디',
  })
  @ApiOperation({ summary: '협업 keep취소하기' })
  @Delete('/:recruitPostId/:recruitKeepId')
  async removeKeepIt(
    @Param('recruitKeepId', ParseIntPipe) keepId: number,
    @Param('recruitPostId', ParseIntPipe) postId: number,
  ) {
    this.recruitPostService.deleteKeepIt(postId, keepId);

    return { success: true };
  }
}
