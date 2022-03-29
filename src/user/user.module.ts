import { RecruitPosts } from './../recruit-post/entities/RecruitPosts';
import { RecruitKeeps } from './../recruit-post/entities/RecruitKeeps';
import { AuthModule } from './../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { Notification } from './entities/Notification';
import { UserReputation } from './entities/UserReputation';
import { ConfigModule } from '@nestjs/config';
import { Users } from './../socialLogin/entity/Users';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forFeature([
      Notification,
      UserReputation,
      Users,
      UserReputation,
      RecruitKeeps,
      RecruitPosts,
    ]),
    AuthModule,
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
