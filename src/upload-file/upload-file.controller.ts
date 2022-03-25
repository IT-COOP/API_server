import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UploadFileService } from './upload-file.service';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multerS3 from 'multer-s3';
import * as AWS from 'aws-sdk';

const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET;
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_S3_ACCESS_KEY,
  secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
  region: process.env.AWS_S3_REGION,
});

@ApiTags('사진 업로드')
@Controller('upload')
export class UploadFileController {
  constructor(private readonly uploadFileService: UploadFileService) {}

  @UseGuards()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: multerS3({
        s3: s3,
        bucket: AWS_S3_BUCKET,
        key: function (req, file, cb) {
          cb(null, `original/recruit/${Date.now()}${file.originalname}`);
        },
      }),
    }),
  )
  @Post('/recruit')
  @ApiOperation({ summary: '협업 게시물 사진 업로드' })
  async uploadRecruitImage(@UploadedFile() file: Express.MulterS3.File) {
    return file.location;
  }

  @UseGuards()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: multerS3({
        s3: s3,
        bucket: AWS_S3_BUCKET,
        key: function (req, file, cb) {
          cb(null, `original/profile/${Date.now()}${file.originalname}`);
        },
      }),
    }),
  )
  @Post('/profile')
  @ApiOperation({ summary: '프로필 사진 업로드' })
  async uploadImage(@UploadedFile() file: Express.MulterS3.File) {
    console.log(file);

    return file;
  }
}
