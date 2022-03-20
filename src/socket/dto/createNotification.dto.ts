import { EventType } from '../enum/eventType.enum';
export class CreateNotificationDto {
  notificationSender: string;
  notificationReceiver: string;
  eventType: EventType;
  eventContent: string;
  targetId: number;
  isRead: boolean;
}
