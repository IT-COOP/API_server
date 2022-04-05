import { Chats } from './socket/entities/Chats';
import { ChatMembers } from './socket/entities/ChatMembers';
import { ChatRooms } from './socket/entities/ChatRooms';
import { socialLoginModule } from './socialLogin/socialLogin.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './socialLogin/entity/Users';
import { AuthModule } from './auth/auth.module';
import { RecruitPostModule } from './recruit-post/recruit-post.module';
import { UserModule } from './user/user.module';
import { RecruitApplies } from './recruit-post/entities/RecruitApplies';
import { RecruitComments } from './recruit-post/entities/RecruitComments';
import { RecruitKeeps } from './recruit-post/entities/RecruitKeeps';
import { RecruitPosts } from './recruit-post/entities/RecruitPosts';
import { RecruitStacks } from './recruit-post/entities/RecruitStacks';
import { RecruitTasks } from './recruit-post/entities/RecruitTasks';
import { Notification } from './user/entities/Notification';
import { UserReputation } from './user/entities/UserReputation';
import { SocketModule } from './socket/socket.module';
import { ChatModule } from './chat/chat.module';
import { UploadFileModule } from './upload-file/upload-file.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './common/common.interceptor';

@Module({
  imports: [
    socialLoginModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          type: 'mysql',
          host: '127.0.0.1',
          port: 3306,
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_DATABASE'),
          entities: [
            Users,
            RecruitApplies,
            RecruitComments,
            RecruitKeeps,
            RecruitPosts,
            RecruitStacks,
            RecruitTasks,
            Notification,
            UserReputation,
            ChatRooms,
            ChatMembers,
            Chats,
          ],
          seeds: ['./database/seeds/**/*{.ts,.js}'],
          factories: ['./database/factories/**/*{.ts,.js}'],
        };
      },
    }),
    RecruitPostModule,
    UserModule,
    SocketModule,
    ChatModule,
    UploadFileModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
