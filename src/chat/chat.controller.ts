import { StrictGuard } from './../auth/auth.guard';
import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}
  @UseGuards(StrictGuard)
  @Get()
  getAllChatRooms(@Res({ passthrough: true }) res) {
    const { userId } = res.locals.user;
    return this.chatService.getAllChatRooms(userId);
  }
}
