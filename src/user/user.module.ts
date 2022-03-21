import { AuthModule } from './../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { Notification } from './entities/Notification';
import { UserReputation } from './entities/UserReputation';
import { ConfigModule } from '@nestjs/config';
import { Users } from 'src/socialLogin/entity/Users';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forFeature([Notification, UserReputation, Users]),
    AuthModule,
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
