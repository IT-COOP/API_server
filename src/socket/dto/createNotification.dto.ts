import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsUUID, IsString, IsBoolean } from 'class-validator';
import { EventType } from '../enum/eventType.enum';
export class CreateNotificationDto {
  @IsUUID()
  @ApiProperty({
    description: '알림을 보내는 사람 userId',
  })
  notificationSender: string;

  @IsUUID()
  @ApiProperty({
    description: '알림을 받는 사람 userId',
  })
  notificationReceiver: string;

  @IsEnum(EventType)
  @ApiProperty({
    description: '보내는 알림의 종류',
  })
  eventType: EventType;

  @IsString()
  @ApiProperty({
    description: '알림의 내용',
  })
  eventContent: string;

  @IsInt()
  @ApiProperty({
    description: '해당 알림이 발생한 장소',
  })
  targetId: number;

  @IsBoolean()
  @ApiProperty({
    description: '알림을 확인했는지',
  })
  isRead: boolean;

  @IsString()
  @ApiProperty({
    description: '알림을 보내는 사람의 닉네임',
  })
  nickname: string;
}
