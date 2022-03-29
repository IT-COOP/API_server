import { CreateNotificationDto } from './socket/dto/createNotification.dto';
import { EventType } from './socket/enum/eventType.enum';
import { Injectable } from '@nestjs/common';
import { Stacks, Location, Tasks } from './common/enums';
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
    return { Location };
  }
  getStackEnum() {
    return { Stacks };
  }
  getTaskEnum() {
    return { Tasks };
  }
}
