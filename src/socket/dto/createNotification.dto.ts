export class CreateNotificationDto {
  notificationSender: string;
  notificationReceiver: string;
  eventType: number;
  eventContent: string;
  targetId: number;
  isRead: boolean;
}
