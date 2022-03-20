import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import * as multer from 'multer';
import * as multerS3 from 'multer-s3';

@Injectable()
export class UploadFileService {
  constructor(private readonly configService: ConfigService) {}
  AWS_S3_BUCKET = this.configService.get<string>('AWS_S3_BUCKET_NAME');
  s3 = new AWS.S3({
    accessKeyId: this.configService.get<string>('AWS_S3_ACCESS_KEY'),
    secretAccessKey: this.configService.get<string>('AWS_S3_SECRET_ACCESS_KEY'),
    region: this.configService.get<string>('AWS_S3_REGION'),
  });

  async uploadFile(path: string, userId: string, req: Request, res: Response) {
    const upload = multer({
      storage: multerS3({
        s3: this.s3,
        bucket: this.AWS_S3_BUCKET,
        acl: 'public-read',
        key: (request, file, cb) => {
          cb(null, `${userId}/${path}/${Date.now().toString()}`);
        },
      }),
    }).array('photo', 1);

    upload(req, res, (err) => {
      if (err) {
        throw new InternalServerErrorException(`${err}`);
      }
      return res.status(201).send(req.files[0].location);
    });
  }
}
// https://codesk.tistory.com/61
