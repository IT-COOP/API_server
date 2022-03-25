import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UploadFileService {
  constructor(private readonly configService: ConfigService) {}

<<<<<<< HEAD
  async uploadFile() {
    //
=======
  async uploadFile(path: string, userId: string, req: Request, res: Response) {
    console.log(req);

    const upload = multer({
      storage: multerS3({
        s3: this.s3,
        bucket: this.AWS_S3_BUCKET,
        acl: 'public-read',
        key: (request, file, cb) => {
          cb(null, `${userId}/${path}/${Date.now().toString()}`);
        },
      }),
    }).single('upload');

    upload(req, res, (err) => {
      if (err) {
        throw new InternalServerErrorException(`${err}`);
      }
      try {
        return res.status(201).send(req.files[0].location);
      } catch (err) {
        throw new InternalServerErrorException(
          `File Upload Failure err: ${err.name} description: ${err.message}`,
        );
      }
    });
>>>>>>> e8f132985234be94595d9c71bbfc0d2455b2d210
  }
}
// https://codesk.tistory.com/61
