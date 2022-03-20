import { Injectable } from '@nestjs/common';
import multer from 'multer';
import * as multerS3 from 'multer-s3';
import * as AWS from 'aws-sdk';
import 'dotenv/config';
import path from 'path';

const AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

@Injectable()
export class ImageService {
  constructor(
    private readonly awsS3: AWS.S3,
    public readonly S3_BUCKET_NAME: string,
  ) {}
  async uploadImage(file: Express.Multer.File, folder: string, userId: string) {
    const upload = multer({
      storage: multerS3({
        s3: this.awsS3,
        bucket: AWS_S3_BUCKET_NAME,
        key: function (req, file, cb) {
          cb(
            null,
            `${userId}/${folder}/${Date.now()}_${path.basename(
              file.originalname,
            )}`,
          );
        },
      }),
    });

    upload.single('img');
    return;
  }
}
