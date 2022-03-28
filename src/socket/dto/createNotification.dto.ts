import { IsEnum, IsInt, IsUUID, IsString, IsBoolean } from 'class-validator';
import { EventType } from '../enum/eventType.enum';
export class CreateNotificationDto {
  @IsUUID()
  notificationSender: string;
  @IsUUID()
  notificationReceiver: string;
  @IsEnum(EventType)
  eventType: EventType;
  @IsString()
  eventContent: string;
  @IsInt()
  targetId: number;
  @IsBoolean()
  isRead: boolean;
}
