import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class MsgToServerDto {
  @IsNumber()
  @ApiProperty({
    description: '채팅을 전송하는 채팅방의 ID',
  })
  chatRoomId: number;

  @IsString()
  @ApiProperty({
    description: '채팅',
  })
  chat: string;
}
