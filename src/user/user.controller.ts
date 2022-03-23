import { Response } from 'express';
import { StrictGuard } from './../auth/auth.guard';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserProfileDTO } from './dto/updateUserProfile.dto';
import { RateUserDto } from './dto/rateUser.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 내 프로필 보기
  @UseGuards(StrictGuard)
  @Get('profile')
  async getMyProfile(@Res({ passthrough: true }) res) {
    const userId = res.locals.user.userId;
    return this.userService.getMyProfile(userId);
  }

  // 다른 프로필 보기
  @UseGuards(StrictGuard)
  @Get('profile/:id')
  async getOthersProfile(
    @Param('id') id: string,
    @Res({ passthrough: true }) res,
  ) {
    const userId = res.locals.user.userId;
    return this.userService.getOthersProfile(id, userId);
  }

  // 내 프로필 수정하기
  @UseGuards(StrictGuard)
  @Put('profile')
  async putMyProfile(
    @Res({ passthrough: true }) res,
    @Body(ValidationPipe) updateUserProfileDTO: UpdateUserProfileDTO,
  ) {
    const userId = res.locals.user.userId;
    return this.userService.putMyProfile(userId, updateUserProfileDTO);
  }

  // 내가 keep한 게시물
  @UseGuards(StrictGuard)
  @Get('mykeep')
  async getMyKeeps(@Res({ passthrough: true }) res) {
    const userId = res.locals.user.userId;
    return this.userService.getMyKeeps(userId);
  }

  // 내가 love한 게시물
  @UseGuards(StrictGuard)
  @Get('mylove')
  async getMyLoves(@Res({ passthrough: true }) res) {
    const userId = res.locals.user.userId;
    return this.userService.getMyLoves(userId);
  }

  // 진행 중인 프로젝트
  @UseGuards(StrictGuard)
  @Get('running')
  async getMyRunningProject(@Res({ passthrough: true }) res) {
    const userId = res.locals.user.userId;
    return this.userService.getMyRunningProject(userId);
  }

  // 신청 중인 프로젝트
  @UseGuards(StrictGuard)
  @Get('applied')
  async getMyAppliedProject(@Res({ passthrough: true }) res) {
    const userId = res.locals.user.userId;
    return this.userService.getMyAppliedProject(userId);
  }

  // 모집 중인 프로젝트 - 신청자 목록
  @UseGuards(StrictGuard)
  @Get('recruiting')
  async getMyRecruitingProject(@Res({ passthrough: true }) res) {
    const userId = res.locals.user.userId;
    return this.userService.getMyRecruitingProject(userId);
  }

  // 진행 완료한 프로젝트
  @UseGuards(StrictGuard)
  @Get('over')
  async getMyOverProject(@Res({ passthrough: true }) res) {
    const userId = res.locals.user.userId;
    return this.userService.getMyOverProject(userId);
  }

  // 유저 평가하기
  @UseGuards(StrictGuard)
  @Post('rate')
  async rateUser(
    @Res({ passthrough: true }) res,
    @Body(ValidationPipe) rateUserDto: RateUserDto,
  ) {
    const userId = res.locals.user.userId;
    return this.userService.rateUser(userId, rateUserDto);
  }

  // 다른 사람 진행 중인 프로젝트
  @UseGuards(StrictGuard)
  @Get('profile/:anotherUserId/running')
  async getOthersRunningProject(
    @Res({ passthrough: true }) res,
    @Param('anotherUserId') anotherUserId: string,
  ) {
    const userId = res.locals.user.userId;
    return this.userService.getOthersRunningProject(userId, anotherUserId);
  }

  // 다른 사람 완료한 프로젝트
  @UseGuards(StrictGuard)
  @Get('profile/:anotherUserId/over')
  async getOthersOverProject(
    @Res({ passthrough: true }) res,
    @Param('anotherUserId') anotherUserId: string,
  ) {
    const userId = res.locals.user.userId;
    return this.userService.getOthersOverProject(userId, anotherUserId);
  }
  //
  //  //내 프로필 가져오기
  //  @UseGuards(StrictGuard)
  //  @Get('/profile')
  //  async getProfile(@Res({ passthrough: true }) res: Response) {
  //    //Error
  //    //Unknown column 'R.userReputationReceiver' in 'on clause'
  //    return await this.userService.readMyProfile(res.locals.user.userId);
  //  }
  //
  //  // @Get('/love')
  //  // async getLovePosts(@Req() user) {
  //  //   return await this.userService.read(user.userId);
  //  // }
  //  @UseGuards(StrictGuard)
  //  @Get('/profile/:anotherUserId')
  //  async getAnotherUserProfile(
  //    @Res({ passthrough: true }) res: Response,
  //    @Param('anotherUserId') anotherUserId,
  //  ) {
  //    console.log('다른 사람 프로필 컨트롤러 도착');
  //    if (anotherUserId === res.locals.user.userId) {
  //      return await this.userService.readMyProfile(res.locals.user.userId);
  //    }
  //    return await this.userService.getAnotherUserProfile(anotherUserId);
  //  }
  //
  //  @UseGuards(StrictGuard)
  //  @Get('/keepIt')
  //  async getKeepPosts(@Res({ passthrough: true }) res) {
  //    console.log('내 킵 컨트롤러 도착');
  //    try {
  //      return await this.userService.readKeepPosts(res.locals.user.userId);
  //    } catch (e) {}
  //  }
  //
  //  @UseGuards(StrictGuard)
  //  @Get('/myRecruits')
  //  async getMyRecruit(@Res({ passthrough: true }) res) {
  //    console.log('내 협업 컨트롤러 도착');
  //    try {
  //      return await this.userService.readMyRecruit(res.locals.user.userId);
  //    } catch (e) {}
  //  }
  //
  //  @UseGuards(StrictGuard)
  //  @Put('/profile')
  //  async putProfile(
  //    @Res({ passthrough: true }) res,
  //    @Body(ValidationPipe) updateUserProfileDTO: UpdateUserProfileDTO,
  //  ) {
  //    console.log('풋 프로필 컨트롤러 도착');
  //    try {
  //      return await this.userService.updateMyProfile(
  //        res.locals.user.userId,
  //        updateUserProfileDTO,
  //      );
  //    } catch (e) {}
  //  }
}
