import { Response } from 'express';
import { StrictGuard } from './../auth/auth.guard';
import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserProfileDTO } from './dto/updateUserProfile.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(StrictGuard)
  @Get('/profile')
  async getProfile(@Res() res: Response) {
    return await this.userService.readMyProfile(res.locals.user.userId);
  }

  // @Get('/love')
  // async getLovePosts(@Req() user) {
  //   return await this.userService.read(user.userId);
  // }
  @UseGuards(StrictGuard)
  @Get('/profile/:anotherUserId')
  async getAnotherUserProfile(
    @Res() res: Response,
    @Param('anotherUserId') anotherUserId,
  ) {
    if (anotherUserId === res.locals.user.userId)
      return await this.userService.getAnotherUserProfile(
        res.locals.user.userId,
        anotherUserId,
      );
  }

  @Get('/keepIt')
  async getKeepPosts(@Res() res) {
    try {
      return await this.userService.readKeepPosts(res.locals.user.userId);
    } catch (e) {}
  }

  @Get('/myRecruits')
  async getMyRecruit(@Res() res) {
    try {
      return await this.userService.readMyRecruit(res.locals.user.userId);
    } catch (e) {}
  }

  @Put('/profile')
  async putProfile(
    @Res() res,
    @Body('', ValidationPipe) updateUserProfileDTO: UpdateUserProfileDTO,
  ) {
    try {
      return await this.userService.updateMyProfile(
        res.locals.user.userId,
        updateUserProfileDTO,
      );
    } catch (e) {}
  }
}
