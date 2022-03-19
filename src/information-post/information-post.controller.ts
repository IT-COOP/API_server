import { LooseGuard, StrictGuard } from './../auth/auth.guard';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Req,
  UseGuards,
  HttpException,
  HttpStatus,
  ParseIntPipe,
  ValidationPipe,
  Query,
} from '@nestjs/common';
import { InformationPostService } from './information-post.service';
import { CreateInformationPostDto } from './dto/create-information-post.dto';
import { UpdateInformationPostDto } from './dto/update-information-post.dto';
import { CreateInformationCommentDto } from './dto/create-information-comment.dto';

@Controller('information')
export class InformationPostController {
  constructor(
    private readonly informationPostService: InformationPostService,
  ) {}

  @UseGuards(LooseGuard)
  @Get()
  async getAllPostsInTime(
    @Req() req,
    @Query('informationPostType', ParseIntPipe) informationPostType: number,
  ) {
    const userId = req.user ? req.user.userInfo.userId : '';
    return this.informationPostService.getAllPostsInTime(
      userId,
      informationPostType,
    );
  }

  @UseGuards(LooseGuard)
  @Get('bookmark')
  async getAllPostsInBookmark(
    @Req() req,
    @Query('informationPostType', ParseIntPipe) informationPostType: number,
  ) {
    const userId = req.user ? req.user.userInfo.userId : '';
    return this.informationPostService.getAllPostsInBookmark(
      userId,
      informationPostType,
    );
  }

  @UseGuards(LooseGuard)
  @Get('like')
  async getAllPostsInLike(
    @Req() req,
    @Query('informationPostType', ParseIntPipe) informationPostType: number,
  ) {
    const userId = req.user ? req.user.userInfo.userId : '';
    return this.informationPostService.getAllPostsInLike(
      userId,
      informationPostType,
    );
  }

  @UseGuards(LooseGuard)
  @Get('/:informationPostId')
  async getOnePost(
    @Req() req,
    @Param('informationPostId', ParseIntPipe) informationPostId: number,
  ) {
    const userId = req.user ? req.user.userInfo.userId : '';
    return this.informationPostService.getOnePost(userId, informationPostId);
  }

  @UseGuards(StrictGuard)
  @Put('/:informationPostId')
  async putPost(
    @Req() req,
    @Param('informationPostId', ParseIntPipe) informationPostId: number,
    @Body(ValidationPipe) updateInformationPostDto: UpdateInformationPostDto,
  ) {
    const userId = req.user ? req.user.userInfo.userId : '';
    return this.informationPostService.putPost(
      userId,
      informationPostId,
      updateInformationPostDto,
    );
  }

  @UseGuards(StrictGuard)
  @Delete('/:informationPostId')
  async deletePost(
    @Req() req,
    @Param('informationPostId', ParseIntPipe) informationPostId: number,
  ) {
    const userId = req.user ? req.user.userInfo.userId : '';
    return this.informationPostService.deletePost(userId, informationPostId);
  }

  @UseGuards(StrictGuard)
  @Post()
  async createInformationPost(
    @Req() req,
    @Body(ValidationPipe) createInformationPostDto: CreateInformationPostDto,
  ) {
    const userId = req.user ? req.user.userInfo.userId : '';
    return this.informationPostService.createInformationPost(
      userId,
      createInformationPostDto,
    );
  }

  @UseGuards(StrictGuard)
  @Post('/:informationPostId/comment')
  async postComment(
    @Req() req,
    @Param('informationPostId', ParseIntPipe) informationPostId: number,
    @Body(ValidationPipe)
    createInformationCommentDto: CreateInformationCommentDto,
  ) {
    const userId = req.user ? req.user.userInfo.userId : '';
    if (!userId) {
      throw new HttpException('Unauthorized Error', HttpStatus.UNAUTHORIZED);
    }
    return this.informationPostService.postComment(
      userId,
      informationPostId,
      createInformationCommentDto,
    );
  }

  @UseGuards(StrictGuard)
  @Put('/:informationPostId/comment/:informationCommentId')
  async putComment(
    @Req() req,
    @Param('informationPostId', ParseIntPipe) informationPostId: number,
    @Param('informationCommentId', ParseIntPipe) informationCommentId: number,
    @Body(ValidationPipe)
    createInformationCommentDto: CreateInformationCommentDto,
  ) {
    const userId = req.user ? req.user.userInfo.userId : '';
    if (!userId) {
      throw new HttpException('Unauthorized Error', HttpStatus.UNAUTHORIZED);
    }
    return this.informationPostService.putComment(
      userId,
      informationPostId,
      informationCommentId,
      createInformationCommentDto,
    );
  }

  @UseGuards(StrictGuard)
  @Delete('/:informationPostId/comment/:informationCommentId')
  async deleteComment(
    @Req() req,
    @Param('informationPostId', ParseIntPipe) informationPostId: number,
    @Param('informationCommentId', ParseIntPipe) informationCommentId: number,
  ) {
    const userId = req.user ? req.user.userInfo.userId : '';
    if (!userId) {
      throw new HttpException('Unauthorized Error', HttpStatus.UNAUTHORIZED);
    }
    return this.informationPostService.deleteComment(
      userId,
      informationPostId,
      informationCommentId,
    );
  }

  @UseGuards(StrictGuard)
  @Post('/:informationPostId/love')
  async postLoveIt(
    @Req() req,
    @Param('informationPostId', ParseIntPipe) informationPostId: number,
  ) {
    const userId = req.user ? req.user.userInfo.userId : '';
    if (!userId) {
      throw new HttpException('Unauthorized Error', HttpStatus.UNAUTHORIZED);
    }
    return this.informationPostService.postLoveIt(userId, informationPostId);
  }

  @UseGuards(StrictGuard)
  @Delete('/:informationPostId/love')
  async deleteLoveIt(
    @Req() req,
    @Param('informationPostId', ParseIntPipe) informationPostId: number,
  ) {
    const userId = req.user ? req.user.userInfo.userId : '';
    if (!userId) {
      throw new HttpException('Unauthorized Error', HttpStatus.UNAUTHORIZED);
    }
    return this.informationPostService.deleteLoveIt(userId, informationPostId);
  }

  @UseGuards(StrictGuard)
  @Post('/:informationPostId/keep')
  async postKeepIt(
    @Req() req,
    @Param('informationPostId', ParseIntPipe) informationPostId: number,
  ) {
    const userId = req.user ? req.user.userInfo.userId : '';
    if (!userId) {
      throw new HttpException('Unauthorized Error', HttpStatus.UNAUTHORIZED);
    }
    return this.informationPostService.postKeepIt(userId, informationPostId);
  }

  @UseGuards(StrictGuard)
  @Delete('/:informationPostId/keep')
  async deleteKeepIt(
    @Req() req,
    @Param('informationPostId', ParseIntPipe) informationPostId: number,
  ) {
    const userId = req.user ? req.user.userInfo.userId : '';
    if (!userId) {
      throw new HttpException('Unauthorized Error', HttpStatus.UNAUTHORIZED);
    }
    return this.informationPostService.deleteKeepIt(userId, informationPostId);
  }
}
