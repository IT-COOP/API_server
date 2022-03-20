import { ChatMembers } from './../socket/entities/ChatMembers';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatMembers)
    private readonly chatMembersRepository: Repository<ChatMembers>,
  ) {}
  async getAllChatRooms(userId: string) {
    const chatRooms = await this.chatMembersRepository.find({
      where: {
        member: userId,
      },
      select: ['chatRoomId'],
      order: { chatRoomId: 'DESC' },
    });
    return chatRooms;
  }
}
