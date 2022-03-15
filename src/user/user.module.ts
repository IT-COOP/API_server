import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { Notification } from './entities/Notification';
import { UserReputation } from './entities/UserReputation';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, UserReputation])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
