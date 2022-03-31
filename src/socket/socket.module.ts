import { RecruitPosts } from './../recruit-post/entities/RecruitPosts';
import { Chats } from './../socket/entities/Chats';
import { ChatRooms } from './entities/ChatRooms';
import { ChatMembers } from './../socket/entities/ChatMembers';
import { RecruitApplies } from './../recruit-post/entities/RecruitApplies';
import { Users } from './../socialLogin/entity/Users';
import { socialLoginModule } from './../socialLogin/socialLogin.module';
import { UserModule } from './../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { forwardRef, Module } from '@nestjs/common';
import { SocketService } from './socket.service';
import { SocketGateway } from './socket.gateway';
import { RecruitPostModule } from './../recruit-post/recruit-post.module';
import { Notification } from './../user/entities/Notification';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [SocketGateway, SocketService],
  imports: [
    TypeOrmModule.forFeature([
      ChatMembers,
      ChatRooms,
      Chats,
      RecruitPosts,
      Notification,
      Users,
      RecruitApplies,
    ]),
    forwardRef(() => RecruitPostModule),
    UserModule,
    socialLoginModule,
    ConfigModule,
  ],
  exports: [SocketGateway, SocketService],
})
export class SocketModule {}
