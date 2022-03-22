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
  ValidationPipe,
} from '@nestjs/common';

import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RecruitApplyDTO } from './dto/apply.dto';
import { RecruitCommentDTO } from './dto/recruitComment.dto';
import { recruitPostDTO } from './dto/recruitPost.dto';
import { RecruitApplies } from './entities/RecruitApplies';
import { RecruitComments } from './entities/RecruitComments';
import { RecruitKeeps } from './entities/RecruitKeeps';
import { RecruitPosts } from './entities/RecruitPosts';
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
  @Get('')
  @ApiOperation({ summary: '협업 게시물 전체 불러오기' })
  async getAllRecruits(
    @Query('sort') order: any,
    @Query('items') items: any,
    @Query('loc') location: any,
    @Query('task') task: any,
    @Query('stack') stack: any,
    @Query('lastId') lastId: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    order = parseInt(order) || 0;
    items = parseInt(items) || 12;
    location = parseInt(location) || 0;
    task = parseInt(task) || 0;
    stack = parseInt(stack) || 0;
    lastId = parseInt(lastId) || 0;

    const { userId } = res.locals.user ? res.locals.user : { userId: '' };
    console.log(userId);
    try {
      const recruits: any = await this.recruitPostService.ReadAllRecruits(
        userId,
        order,
        items,
        location,
        task,
        stack,
        lastId,
      );
      console.log(recruits);
      return recruits;
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
    @Res({ passthrough: true }) res: Response,
    @Param('recruitPostId', ParseIntPipe) recruitPostId: number,
  ) {
    const { userId } = res.locals.user;

    try {
      const details: any = await this.recruitPostService.ReadSpecificRecruits(
        recruitPostId,
        userId,
      );
      return details;
    } catch {}
  }

  @ApiParam({
    name: 'recruitPostId',
    required: true,
    description: '상세 협업 게시물 아이디',
  })
  @UseGuards(StrictGuard)
  @Post()
  @ApiOperation({ summary: '협업 게시물 쓰기' })
  async postRecruit(
    @Res({ passthrough: true }) res: Response,
    @Body(ValidationPipe) body: recruitPostDTO,
  ) {
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
    }: { recruitTasks: any; recruitStacks: any } = body;

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
    @Res({ passthrough: true }) res: Response,
    @Body(ValidationPipe) body: recruitPostDTO,
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
    @Res({ passthrough: true }) res: Response,
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
    @Res({ passthrough: true }) res: Response,
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
    @Res({ passthrough: true }) res: Response,
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
    @Res({ passthrough: true }) res: Response,
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
    @Res({ passthrough: true }) res: Response,
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
  @UseGuards(StrictGuard)
  @ApiOperation({ summary: '협업 keep취소하기' })
  @Delete('/:recruitPostId/:recruitKeepId')
  async removeKeepIt(
    @Param('recruitKeepId', ParseIntPipe) keepId: number,
    @Param('recruitPostId', ParseIntPipe) postId: number,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { userId } = res.locals.user;
    this.recruitPostService.deleteKeepIt(postId, keepId);

    return { success: true };
  }
}
