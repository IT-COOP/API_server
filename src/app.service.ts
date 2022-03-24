import { CreateNotificationDto } from './socket/dto/createNotification.dto';
import { EventType } from './socket/enum/eventType.enum';
import { location, stack, task } from './recruit-post/enums/recruit.enums';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    const now = new Date();
    return now.toLocaleString();
  }

  getNotificationEnum() {
    return { EventType, notification: CreateNotificationDto };
  }
  getLocationEnum() {
    return { location };
  }
  getStackEnum() {
    return { stack };
  }
  getTaskEnum() {
    return { task };
  }
}
