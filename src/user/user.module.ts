import { ChatMembers } from './../socket/entities/ChatMembers';
import { ChatRooms } from './../socket/entities/ChatRooms';
import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserReputation } from './entities/UserReputation';
import { SocketModule } from './../socket/socket.module';
import { RecruitPosts } from './../recruit-post/entities/RecruitPosts';
import { AuthModule } from './../auth/auth.module';
import { Users } from './../socialLogin/entity/Users';
import { RecruitApplies } from './../recruit-post/entities/RecruitApplies';
import { RecruitStacks } from './../recruit-post/entities/RecruitStacks';
import { RecruitTasks } from './../recruit-post/entities/RecruitTasks';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      Users,
      UserReputation,
      RecruitPosts,
      RecruitApplies,
      RecruitStacks,
      RecruitTasks,
      ChatRooms,
      ChatMembers,
    ]),
    AuthModule,
    forwardRef(() => SocketModule),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
