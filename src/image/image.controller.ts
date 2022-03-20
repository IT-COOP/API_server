import {
  Controller,
  Post,
  Req,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageService } from './image.service';
import 'dotenv/config';
import { Users } from 'aws-sdk/clients/budgets';

@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post('/profile')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfileImage(
    @UploadedFiles() file: Express.Multer.File,
    @Res() res,
  ) {
    return this.imageService.uploadImage(
      file,
      'profile',
      res.locals.user.userId,
    );
  }

  @Post('/recruit')
  @UseInterceptors(FileInterceptor('file'))
  async uploadRecruitImage(
    @UploadedFiles() file: Express.Multer.File,
    @Res() res,
  ) {
    return this.imageService.uploadImage(
      file,
      'recruit',
      res.locals.user.userId,
    );
  }

  @Post('/information')
  @UseInterceptors(FileInterceptor('file'))
  async uploadInformationImage(
    @UploadedFiles() file: Express.Multer.File,
    @Res() res,
  ) {
    return this.imageService.uploadImage(
      file,
      'information',
      res.locals.user.userId,
    );
  }
}
