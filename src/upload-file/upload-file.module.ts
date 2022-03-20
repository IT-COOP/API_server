import { AuthModule } from './../auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { UploadFileController } from './upload-file.controller';
import { UploadFileService } from './upload-file.service';

@Module({
  controllers: [UploadFileController],
  providers: [UploadFileService, ConfigService],
  imports: [ConfigModule, AuthModule],
})
export class UploadFileModule {}
