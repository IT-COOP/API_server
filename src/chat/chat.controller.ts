import { StrictGuard } from './../auth/auth.guard';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}
  @UseGuards(StrictGuard)
  @Get()
  getAllChatRooms(@Req() req) {
    const { userId } = req.user.userInfo;
    return this.chatService.getAllChatRooms(userId);
  }
}
