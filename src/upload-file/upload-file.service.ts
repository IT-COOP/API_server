import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UploadFileService {
  constructor(private readonly configService: ConfigService) {}

  async uploadFile() {
    //
  }
}
// https://codesk.tistory.com/61
