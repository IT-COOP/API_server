import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateUserProfileDTO } from './dto/createUserProfile.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UseInterceptors(FileInterceptor('profileImg'))
  create(
    @Req() user,
    @UploadedFile() file: Express.Multer.File,
    @Body() createUserProfileDto: CreateUserProfileDTO,
  ) {
    return this.userService.createUserProfile(
      'profileImg',
      user.userId,
      file,
      createUserProfileDto,
    );
  }

  @Get('/profile')
  async getProfile(@Req() user) {
    return this.userService.getMyProfile(user.userId);
  }

  @Get('/love')
  getLovePosts(@Req() user) {
    return this.userService.getLovePosts(user.userId);
  }

  @Get('/keep')
  getKeepPosts(@Req() user) {
    return this.userService.getKeepPosts(user.userId);
  }
}
