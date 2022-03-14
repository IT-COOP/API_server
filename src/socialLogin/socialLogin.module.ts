import { AuthModule } from './../auth/auth.module';
import { Users } from './entity/users.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { SocialLoginService } from './socialLogin.service';
import { SocialLoginController } from './socialLogin.controller';

@Module({
  providers: [SocialLoginService, ConfigService],
  controllers: [SocialLoginController],
  imports: [
    HttpModule,
    ConfigModule,
    TypeOrmModule.forFeature([Users]),
    AuthModule,
  ],
})
export class socialLoginModule {}
