import { StrictGuard } from './../auth/auth.guard';
import { Controller, Post, UseGuards, Req, Res } from '@nestjs/common';
import { UploadFileService } from './upload-file.service';
import { Request, Response } from 'express';

@Controller('upload')
export class UploadFileController {
  constructor(private readonly uploadFileService: UploadFileService) {}
  @Post('/recruit')
  @UseGuards(StrictGuard)
  async uploadRecruitImage(@Req() req, @Res() res) {
    return await this.uploadFileService.uploadFile(
      'recruit',
      req.user.userInfo.userId,
      req,
      res,
    );
  }

  @Post('/information')
  @UseGuards(StrictGuard)
  async uploadInformationImage(@Req() req, @Res() res) {
    return await this.uploadFileService.uploadFile(
      'information',
      req.user.userInfo.userId,
      req,
      res,
    );
  }

  @Post('/profile')
  @UseGuards(StrictGuard)
  async uploadProfileImage(@Req() req, @Res() res) {
    return await this.uploadFileService.uploadFile(
      'profile',
      req.user.userInfo.userId,
      req,
      res,
    );
  }
}
