import { UserModule } from './../user/user.module';
import { RecruitPosts } from './../../output/entities/RecruitPosts';
import { Chats } from './../../output/entities/Chats';
import { ChatRooms } from './../../output/entities/ChatRooms';
import { ChatMembers } from './../../output/entities/ChatMembers';
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
    ]),
    RecruitPostModule,
    UserModule,
  ],
})
export class SocketModule {}
