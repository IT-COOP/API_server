import { AuthModule } from './../auth/auth.module';
import { ChatMembers } from './../socket/entities/ChatMembers';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';

@Module({
  controllers: [ChatController],
  providers: [ChatService],
  imports: [TypeOrmModule.forFeature([ChatMembers]), AuthModule],
})
export class ChatModule {}
