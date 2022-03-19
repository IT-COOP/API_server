import { Chats } from './../../output/entities/Chats';
import { ChatRooms } from './../../output/entities/ChatRooms';
import { ChatMembers } from './../../output/entities/ChatMembers';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { SocketService } from './socket.service';
import { SocketGateway } from './socket.gateway';

@Module({
  providers: [SocketGateway, SocketService],
  imports: [TypeOrmModule.forFeature([ChatMembers, ChatRooms, Chats])],
})
export class SocketModule {}
