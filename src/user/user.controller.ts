import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/profile')
  async getProfile(@Req() user) {
    return await this.userService.readMyProfile(user.userId);
  }

  // @Get('/love')
  // async getLovePosts(@Req() user) {
  //   return await this.userService.read(user.userId);
  // }

  @Get('/keepIt')
  async getKeepPosts(@Req() user) {
    try {
      return await this.userService.readKeepPosts(user.userId);
    } catch (e) {}
  }

  @Get('/myRecruits')
  async getMyRecruit(@Req() user) {
    try {
      return await this.userService.readMyRecruit(user.userId);
    } catch (e) {}
  }

  @Post('/profile')
  async postMyRecruit(@Req() user, @Body() ) {
    try {
      return await this.userService.readMyRecruit(user.userId);
    } catch (e) {}
  }
}
