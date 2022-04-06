import { LooseGuard, StrictGuard } from './../auth/auth.guard';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
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
import { RecruitPostDTO } from './dto/recruitPost.dto';
import { RecruitApplies } from './entities/RecruitApplies';
import { RecruitComments } from './entities/RecruitComments';
import { RecruitKeeps } from './entities/RecruitKeeps';
import { RecruitPosts } from './entities/RecruitPosts';
import { RecruitPostService } from './recruit-post.service';
import { Response } from 'express';
import { UpdateDetailPostsDTO } from './dto/updateRecruitPost.dto';
import { RecruitStacks } from './entities/RecruitStacks';
import { RecruitTasks } from './entities/RecruitTasks';
import { ResRecruitPostsDTO } from './dto/resRecruitPosts.dto';
import { ResDetailPostDTO } from './dto/resDetailPost.dto';
import { recruitError } from './../common/error';

@ApiTags('프로젝트 게시판')
@Controller('recruit')
export class RecruitPostController {
  constructor(private readonly recruitPostService: RecruitPostService) {}

  @ApiQuery({
    name: 'loc',
    required: false,
    description: '장소 정보',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: '정렬 정보',
  })
  @ApiQuery({
    name: 'items',
    required: false,
    description: '가져올 아이템 갯수',
  })
  @ApiQuery({
    name: 'task',
    required: false,
    description: '직군 번호',
  })
  @ApiQuery({
    name: 'stack',
    required: false,
    description: '스텍 번호',
  })
  @ApiQuery({
    name: 'cur',
    required: false,
    description: '마지막으로 가져온 포스트 아이디',
  })
  @ApiQuery({
    name: 'over',
    required: false,
    description: '모집중인 글만 보기 0이면 전체 1이면 모집중인 글만 보기',
  })
  @Get('')
  @ApiOperation({ summary: '협업 게시물 전체 불러오기' })
  @UseGuards(LooseGuard)
  async getAllRecruits(
    @Query() conditions,
    @Res({ passthrough: true }) res: Response,
  ) {
    let sort;
    let items;
    let loc;
    let task;
    let stack;
    let cur;
    let over;
    const isNumber = /^[0-9]*$/;
    if (isNumber.test(conditions.sort) || !conditions.sort) {
      sort = parseInt(conditions.sort) || 0;
    } else {
      throw recruitError.WrongRequiredError;
    }
    if (isNumber.test(conditions.items) || !conditions.items) {
      items = parseInt(conditions.items) || 12;
    } else {
      throw recruitError.WrongRequiredError;
    }
    if (isNumber.test(conditions.loc) || !conditions.loc) {
      loc = parseInt(conditions.loc) || 0;
    } else {
      throw recruitError.WrongRequiredError;
    }
    if (isNumber.test(conditions.task) || !conditions.task) {
      task = parseInt(conditions.task) || 0;
    } else {
      throw recruitError.WrongRequiredError;
    }
    if (isNumber.test(conditions.stack) || !conditions.stack) {
      stack = parseInt(conditions.stack) || 0;
    } else {
      throw recruitError.WrongRequiredError;
    }
    if (isNumber.test(conditions.cur) || !conditions.cur) {
      cur = parseInt(conditions.cur) || 0;
    } else {
      throw recruitError.WrongRequiredError;
    }
    if (isNumber.test(conditions.over) || !conditions.over) {
      over = parseInt(conditions.over) || 0;
    } else {
      throw recruitError.WrongRequiredError;
    }
    const { userId } = res.locals.user ? res.locals.user : { userId: '' };

    if (items > 12) {
      throw new BadRequestException('You can import up to 12 posts.');
    }
    const recruitPosts: RecruitPosts[] =
      await this.recruitPostService.ReadAllRecruits(
        userId,
        sort,
        items,
        loc,
        task,
        stack,
        cur,
        over,
      );

    const recruits: ResRecruitPostsDTO[] = await recruitPosts.map(
      (item: RecruitPosts) => {
        const obj = new ResRecruitPostsDTO();
        obj.recruitPostId = item.recruitPostId;
        obj.title = item.title;
        obj.nickname = item.author2.nickname;
        obj.thumbImgUrl = item.thumbImgUrl;
        obj.recruitContent = item.recruitContent;
        obj.recruitLocation = item.recruitLocation;
        obj.recruitKeepCount = item.recruitKeepCount;
        obj.recruitCommentCount = item.recruitComments.length;
        obj.recruitDurationWeeks = item.recruitDurationDays / 7;
        obj.createdAt = item.createdAt.toISOString();
        if (item.createdAt === item.endAt) obj.status = 0;
        if (+Date.now() < +item.endAt) obj.status = 1;
        if (+Date.now() > +item.endAt) obj.status = 2;
        obj.isKeeps = item.recruitKeeps.length ? true : false;

        obj.recruitTasks = item.recruitTasks;
        obj.recruitStacks = item.recruitStacks;

        return obj;
      },
    );

    return recruits;
  }

  @ApiParam({
    name: 'recruitPostId',
    required: true,
    description: '상세 협업 게시물',
  })
  @ApiOperation({ summary: '협업 상세 게시물 불러오기' })
  @UseGuards(LooseGuard)
  @Get('/:recruitPostId')
  async getDetailRecruit(
    @Res({ passthrough: true }) res: Response,
    @Param('recruitPostId', ParseIntPipe) recruitPostId: number,
  ) {
    const { userId } = res.locals && res.locals.user ? res.locals.user : null;

    const recruitPost: RecruitPosts =
      await this.recruitPostService.ReadSpecificRecruits(recruitPostId, userId);

    const details: ResDetailPostDTO = new ResDetailPostDTO();
    details.recruitPostId = recruitPost.recruitPostId;
    details.title = recruitPost.title;
    details.userId = recruitPost.author;
    details.userProfileImgUrl = recruitPost.author2.profileImgUrl;
    details.nickname = recruitPost.author2.nickname;
    details.thumbImgUrl = recruitPost.thumbImgUrl;
    details.recruitContent = recruitPost.recruitContent;
    details.recruitLocation = recruitPost.recruitLocation;
    details.recruitKeepCount = recruitPost.recruitKeepCount;
    details.viewCount = recruitPost.viewCount;
    details.recruitDurationWeeks = recruitPost.recruitDurationDays / 7;

    details.createdAt = recruitPost.createdAt.toISOString();
    details.endAt = recruitPost.endAt.toISOString();

    if (userId) {
      details.keepId = recruitPost.recruitKeeps.length
        ? recruitPost.recruitKeeps[0].recruitKeepId
        : 0;
      details.applyId = recruitPost.recruitApplies.length
        ? recruitPost.recruitApplies[0].recruitApplyId
        : 0;
    } else {
      details.keepId = 0;
      details.applyId = 0;
    }

    details.recruitTasks = recruitPost.recruitTasks;
    details.recruitStacks = recruitPost.recruitStacks;
    details.recruitComments = recruitPost.recruitComments;

    return details;
  }

  @UseGuards(StrictGuard)
  @Post()
  @ApiOperation({ summary: '협업 게시물 쓰기' })
  async postRecruit(
    @Res({ passthrough: true }) res: Response,
    @Body(ValidationPipe) body: RecruitPostDTO,
  ) {
    const { userId } = res.locals.user;
    const recruitPost = new RecruitPosts();
    recruitPost.author = userId;
    recruitPost.title = body.title;
    recruitPost.recruitContent = body.recruitContent;
    recruitPost.recruitLocation = body.recruitLocation;
    recruitPost.recruitDurationDays = body.recruitDurationWeek * 7;
    recruitPost.thumbImgUrl = body.thumbImgUrl;
    recruitPost.recruitKeepCount = 0;
    recruitPost.viewCount = 0;

    const {
      recruitTasks,
      recruitStacks,
    }: { recruitTasks: RecruitTasks[]; recruitStacks: RecruitStacks[] } = body;

    // await this.recruitPostService.readRecruitCount(userId);
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
  @Patch('/:recruitPostId')
  async modifyRecruit(
    @Param('recruitPostId', ParseIntPipe) recruitPostId,
    @Res({ passthrough: true }) res: Response,
    @Body(ValidationPipe) body: UpdateDetailPostsDTO,
  ) {
    const { userId } = res.locals.user;
    const recruitPost = new RecruitPosts();
    recruitPost.author = userId;
    recruitPost.title = body.title;
    recruitPost.recruitLocation = body.recruitLocation;
    recruitPost.recruitContent = body.recruitContent;
    recruitPost.recruitDurationDays = body.recruitDurationWeek * 7;
    recruitPost.thumbImgUrl = body.thumbImgUrl;

    await this.recruitPostService.updateRecruitPost(recruitPost, recruitPostId);

    return { success: true };
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
    @Body(ValidationPipe) body: RecruitCommentDTO,
  ) {
    const { userId, nickname } = res.locals.user;
    const comment = new RecruitComments();
    comment.userId = userId;
    comment.recruitPostId = recruitPostId;
    comment.commentGroup = body.commentGroup;
    comment.recruitCommentContent = body.recruitCommentContent;

    await this.recruitPostService.createComment(comment, nickname);

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
    @Body(ValidationPipe) body: RecruitCommentDTO,
  ) {
    const { userId } = res.locals.user;

    const comment = new RecruitComments();
    comment.userId = userId;
    comment.recruitPostId = recruitPostId;
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
    @Body(ValidationPipe) body: RecruitApplyDTO,
  ) {
    const { userId, nickname } = res.locals.user;
    const apply = new RecruitApplies();
    apply.applicant = userId;
    apply.recruitPostId = postId;
    apply.applyMessage = body.applyMessage;
    apply.task = body.task;
    apply.isAccepted = false;

    await this.recruitPostService.createApply(postId, apply, nickname);

    return { success: true };
  }

  @ApiParam({
    name: 'recruitPostId',
    required: true,
    description: '포스트 아이디',
  })
  @ApiOperation({ summary: '협업 keep하기' })
  @UseGuards(StrictGuard)
  @Post('/:recruitPostId/keep')
  async postKeepIt(
    @Param('recruitPostId', ParseIntPipe) postId: number,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { userId } = res.locals.user;
    const recruitKeepIt = new RecruitKeeps();
    recruitKeepIt.userId = userId;
    recruitKeepIt.recruitPostId = postId;

    await this.recruitPostService.createKeepIt(postId, recruitKeepIt);
    return { success: true };
  }

  @ApiParam({
    name: 'recruitPostId',
    required: true,
    description: '포스트 아이디',
  })
  @UseGuards(StrictGuard)
  @Delete('/:recruitPostId')
  async removeRecruitPost(
    @Param('recruitPostId', ParseIntPipe) postId: number,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { userId } = res.locals.user;
    await this.recruitPostService.deleteRecruitPost(postId, userId);

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
  @UseGuards(StrictGuard)
  @ApiOperation({ summary: '협업 댓글 삭제하기' })
  @Delete('/:recruitPostId/comment/:recruitCommentId')
  async removeComment(
    @Param('recruitCommentId', ParseIntPipe) commentId: number,
    @Param('recruitPostId', ParseIntPipe) postId: number,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { userId } = res.locals.user;
    await this.recruitPostService.deleteComment(postId, commentId, userId);
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
  @Delete('/:recruitPostId/apply/:applyId')
  async removeApply(
    @Param('applyId', ParseIntPipe) applyId: number,
    @Param('recruitPostId', ParseIntPipe) postId: number,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { userId } = res.locals.user;
    await this.recruitPostService.deleteApply(postId, applyId, userId);

    return { success: true };
  }

  @ApiParam({
    name: 'recruitPostId',
    required: true,
    description: '포스트 아이디',
  })
  @ApiOperation({ summary: '협업 keep취소하기' })
  @Delete('/:recruitPostId/keep/:keepId')
  @UseGuards(StrictGuard)
  async removeKeepIt(
    @Param('recruitPostId', ParseIntPipe) postId: number,
    @Param('keepId', ParseIntPipe) keepId: number,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { userId } = res.locals.user;
    await this.recruitPostService.deleteKeepIt(postId, keepId, userId);

    return { success: true };
  }
}
