import { RecruitPosts } from './../recruit-post/entities/RecruitPosts';
import { Chats } from 'src/socket/entities/Chats';
import { ChatRooms } from './entities/ChatRooms';
import { ChatMembers } from 'src/socket/entities/ChatMembers';
import { RecruitApplies } from './../recruit-post/entities/RecruitApplies';
import { Users } from './../socialLogin/entity/Users';
import { socialLoginModule } from './../socialLogin/socialLogin.module';
import { UserModule } from './../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { SocketService } from './socket.service';
import { SocketGateway } from './socket.gateway';
import { RecruitPostModule } from 'src/recruit-post/recruit-post.module';
import { Notification } from 'src/user/entities/Notification';

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
    RecruitPostModule,
    UserModule,
    socialLoginModule,
  ],
  exports: [SocketGateway],
})
export class SocketModule {}
