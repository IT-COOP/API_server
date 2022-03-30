import { ApiOperation, ApiTags, ApiParam, ApiHeader } from '@nestjs/swagger';
import { StrictGuard } from './../auth/auth.guard';
import {
  Body,
  Controller,
  Get,
  Param,
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
  @UseGuards(StrictGuard)
  @Get('profile')
  @ApiOperation({ summary: '내 프로필 보기' })
  getMyProfile(@Res({ passthrough: true }) res) {
    const userId = res.locals.user.userId;
    return this.userService.getMyProfile(userId);
  }

  // 다른 프로필 보기
  @UseGuards(StrictGuard)
  @Get('profile/:userId')
  @ApiOperation({ summary: '다른 사람 프로필 보기' })
  getOthersProfile(@Param('userId') userId: string) {
    return this.userService.getOthersProfile(userId);
  }

  // 내 프로필 수정하기
  @UseGuards(StrictGuard)
  @Patch('profile')
  @ApiOperation({ summary: '내 프로필 수정하기' })
  putMyProfile(
    @Res({ passthrough: true }) res,
    @Body(ValidationPipe) updateUserProfileDTO: UpdateUserProfileDTO,
  ) {
    const userId = res.locals.user.userId;
    return this.userService.putMyProfile(userId, updateUserProfileDTO);
  }

  // 내가 keep한 게시물
  @UseGuards(StrictGuard)
  @Get('keep')
  @ApiParam({
    name: 'items',
    required: false,
    description:
      '받을 게시물의 갯수를 의미합니다. input이 주어지지 않을 경우, default는 12입니다.',
  })
  @ApiParam({
    name: 'cur',
    required: false,
    description:
      '마지막으로 주어진 게시물의 postId를 말합니다. input이 주어지지 않을 경우, 최신 게시물을 기준으로 합니다.',
  })
  @ApiOperation({ summary: '내가 keep한 게시물 보기' })
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
  @UseGuards(StrictGuard)
  @Get('running/:userId')
  @ApiOperation({ summary: '내가 진행 중인 프로젝트 보기' })
  getMyRunningProject(@Param('userId') userId: string) {
    return this.userService.getMyRunningProject(userId);
  }

  // 내가 신청 중인 프로젝트
  @UseGuards(StrictGuard)
  @Get('applied')
  @ApiOperation({ summary: '내가 신청한 프로젝트 보기' })
  getMyAppliedProject(@Res({ passthrough: true }) res) {
    const userId = res.locals.user.userId;
    return this.userService.getMyAppliedProject(userId);
  }

  // 모집 중인 프로젝트 - 신청자 목록은 분기처리
  @UseGuards(StrictGuard)
  @Get('recruiting/:userId')
  @ApiOperation({
    summary:
      '모집 중인 프로젝트 보기 - 내가 신청한 프로젝트일 경우, 신청자 목록',
  })
  getMyRecruitingProject(
    @Param('userId') userId: string,
    @Res({ passthrough: true }) res,
  ) {
    const loginId = res.locals.user.userId;
    return this.userService.getMyRecruitingProject(userId, loginId);
  }

  // 진행 완료한 프로젝트
  @UseGuards(StrictGuard)
  @Get('over/:userId')
  @ApiOperation({ summary: '내가 진행 완료한 프로젝트 보기' })
  getMyOverProject(@Param('userId') userId: string) {
    return this.userService.getMyOverProject(userId);
  }

  // 협업 점수
  @UseGuards(StrictGuard)
  @Get('level/:userId')
  @ApiOperation({ summary: '내가 지금가지 완료한 프로젝트 갯수' })
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
}
