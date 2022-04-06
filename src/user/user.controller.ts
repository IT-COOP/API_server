import { ResponseToApplyDto } from './dto/responseToApply.dto';
import { ApiOperation, ApiTags, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { StrictGuard } from './../auth/auth.guard';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserProfileDTO } from './dto/updateUserProfile.dto';
import { RateUserDto } from './dto/rateUser.dto';

// @ApiHeader({
//   name: 'authorization',
//   required: true,
//   description: 'Bearer ${accessToken}',
// })
@ApiTags('마이페이지')
@ApiHeader({
  name: 'authorization',
  example: 'Bearer ${accessToken}',
  description: '엑세스 토큰입니다.',
})
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 내 프로필 보기
  @ApiOperation({ summary: '내 프로필 보기' })
  @UseGuards(StrictGuard)
  @Get('profile')
  getMyProfile(@Res() res) {
    return this.userService.getMyProfile(res);
  }

  // 다른 프로필 보기
  @ApiOperation({ summary: '다른 사람 프로필 보기' })
  @UseGuards(StrictGuard)
  @Get('profile/:userId')
  getOthersProfile(@Param('userId') userId: string) {
    return this.userService.getOthersProfile(userId);
  }

  // 내 프로필 수정하기
  @ApiOperation({ summary: '내 프로필 수정하기' })
  @UseGuards(StrictGuard)
  @Patch('profile')
  patchMyProfile(
    @Res({ passthrough: true }) res,
    @Body(ValidationPipe) updateUserProfileDTO: UpdateUserProfileDTO,
  ) {
    const userId = res.locals.user.userId;
    return this.userService.patchMyProfile(userId, updateUserProfileDTO);
  }

  // 내가 keep한 게시물

  @ApiQuery({
    name: 'items',
    required: false,
    description:
      '받을 게시물의 갯수를 의미합니다. input이 주어지지 않을 경우, default는 12입니다.',
  })
  @ApiQuery({
    name: 'cur',
    required: false,
    description:
      '마지막으로 주어진 게시물의 postId를 말합니다. input이 주어지지 않을 경우, 최신 게시물을 기준으로 합니다.',
  })
  @ApiOperation({ summary: '내가 keep한 게시물 보기' })
  @UseGuards(StrictGuard)
  @Get('keep')
  getMyKeeps(
    @Res({ passthrough: true }) res,
    @Query('cur') lastId,
    @Query('items') items,
  ) {
    (lastId = parseInt(lastId) || 100000000), (items = parseInt(items) || 12);
    const userId = res.locals.user.userId;
    return this.userService.getMyKeeps(userId, lastId, items);
  }

  // 진행 중인 프로젝트
  @ApiOperation({ summary: '진행 중인 프로젝트 보기' })
  @UseGuards(StrictGuard)
  @Get('running/:userId')
  getMyRunningProject(@Param('userId') userId: string) {
    return this.userService.getMyRunningProject(userId);
  }

  // 내가 신청 중인 프로젝트
  @ApiOperation({ summary: '내가 신청 중인 프로젝트 보기' })
  @UseGuards(StrictGuard)
  @Get('applied')
  getMyAppliedProject(@Res({ passthrough: true }) res) {
    const userId = res.locals.user.userId;
    return this.userService.getMyAppliedProject(userId);
  }

  @ApiOperation({ summary: '신청 수락 혹은 거절하기' })
  @UseGuards(StrictGuard)
  @Post('recruiting/response')
  responseToApply(
    @Res({ passthrough: true }) res,
    @Body() responseToApplyDto: ResponseToApplyDto,
  ) {
    console.log(responseToApplyDto);
    const userId = res.locals.user.userId;
    return this.userService.responseToApply(userId, responseToApplyDto);
  }

  // 모집 중인 프로젝트 - 신청자 목록은 분기처리
  @ApiOperation({
    summary:
      '모집 중인 프로젝트 보기 - 내가 신청한 프로젝트일 경우, 신청자 목록',
  })
  @UseGuards(StrictGuard)
  @Get('recruiting/:userId')
  getMyRecruitingProject(
    @Param('userId') userId: string,
    @Res({ passthrough: true }) res,
  ) {
    const loginId = res.locals.user.userId;
    return this.userService.getMyRecruitingProject(userId, loginId);
  }

  // 진행 완료한 프로젝트
  @ApiOperation({ summary: '진행 완료한 프로젝트 보기' })
  @UseGuards(StrictGuard)
  @Get('over/:userId')
  getMyOverProject(@Param('userId') userId: string) {
    return this.userService.getMyOverProject(userId);
  }

  // 협업 점수
  @ApiOperation({ summary: '지금까지 완료한 프로젝트 갯수' })
  @UseGuards(StrictGuard)
  @Get('level/:userId')
  getMyLevel(@Param('userId') userId: string) {
    return this.userService.getMyLevel(userId);
  }

  // 유저 평가하기
  @UseGuards(StrictGuard)
  @Post('rate')
  @ApiOperation({ summary: '다른 유저 평가하기' })
  rateUser(
    @Res({ passthrough: true }) res,
    @Body(ValidationPipe) rateUserDto: RateUserDto,
  ) {
    const userId = res.locals.user.userId;
    return this.userService.rateUser(userId, rateUserDto);
  }

  // 채팅방 만들기
  @UseGuards(StrictGuard)
  @Post('/:recruitPostId/create')
  @ApiOperation({ summary: '협업 시작하기, 채팅방 만들기' })
  completeRecruit(
    @Res({ passthrough: true }) res,
    @Param('recruitPostId', ParseIntPipe) recruitPostId: number,
  ) {
    const userId = res.locals.user.userId;
    return this.userService.completeRecruit(userId, recruitPostId);
  }

  @UseGuards(StrictGuard)
  @Get('recruiting/applies/:recruitPostId')
  @ApiOperation({ summary: '협업 신청 보기 - 모든 정보' })
  getRecruitApplies(
    @Res({ passthrough: true }) res,
    @Param('recruitPostId', ParseIntPipe) recruitPostId,
    @Query('isAccepted', ParseIntPipe) isAccepted,
  ) {
    if (1 < isAccepted || isAccepted < 0) {
      throw new BadRequestException('Wrong Request.');
    }
    const userId = res.locals.user.userId;
    return this.userService.getRecruitApplies(
      userId,
      recruitPostId,
      isAccepted,
    );
  }

  @UseGuards(StrictGuard)
  @Get('recruiting/accepted/:recruitPostId')
  @ApiOperation({ summary: '협업 신청 보기 - 수락자 명수' })
  getRecruitAppliesProfileImgUrl(
    @Res({ passthrough: true }) res,
    @Param('recruitPostId', ParseIntPipe) recruitPostId,
  ) {
    const userId = res.locals.user.userId;
    return this.userService.getRecruitAppliesProfileImgUrl(
      userId,
      recruitPostId,
    );
  }

  @UseGuards(StrictGuard)
  @Get('recruiting/reputation/:recruitPostId')
  @ApiOperation({ summary: '완료 된 post에 user 평가' })
  getRecruitReputation(
    @Res({ passthrough: true }) res,
    @Param('recruitPostId', ParseIntPipe) recruitPostId,
  ) {
    const userId = res.locals.user.userId;
    return this.userService.getRecruitReputation(userId, recruitPostId);
  }
}
