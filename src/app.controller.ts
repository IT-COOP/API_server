import { ApiTags } from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@ApiTags('enums & serverTime')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('notification')
  getNotificationEnum() {
    return this.appService.getNotificationEnum();
  }
  @Get('location')
  getLocationEnum() {
    return this.appService.getLocationEnum();
  }
  @Get('stack')
  getStackEnum() {
    return this.appService.getStackEnum();
  }
  @Get('task')
  getTaskEnum() {
    return this.appService.getTaskEnum();
  }
}
