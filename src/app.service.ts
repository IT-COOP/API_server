import { CreateNotificationDto } from './socket/dto/createNotification.dto';
import { EventType } from './socket/enum/eventType.enum';
import { location, stack, task } from './recruit-post/enums/recruit.enums';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
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
