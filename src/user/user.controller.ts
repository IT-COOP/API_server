import {
  Controller,
  Get,
  Req,
} from '@nestjs/common';
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
    return await this.userService.readKeepPosts(user.userId);
  }

  @Get('/recruit')
  async getMyRecruit(@Req() user){
    return await this.userService.readMyRecruit(user.userId);
  }
}
