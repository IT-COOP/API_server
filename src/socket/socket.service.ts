import { EventServerToClient } from './../common/socket.event';
import { Users } from './../socialLogin/entity/Users';
import { RecruitApplies } from './../recruit-post/entities/RecruitApplies';
import { RecruitPosts } from './../recruit-post/entities/RecruitPosts';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMembers } from './entities/ChatMembers';
import { ChatRooms } from './entities/ChatRooms';
import { Chats } from './entities/Chats';
import { Notification } from './../user/entities/Notification';
import { MsgToServerDto } from './dto/msgToServer.dto';
import { Server, Socket } from 'socket.io';
import { CreateNotificationDto } from './dto/createNotification.dto';
import { EventType } from './enum/eventType.enum';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class SocketService {
  constructor(
    @InjectRepository(Chats)
    private readonly chatRepository: Repository<Chats>,
    @InjectRepository(ChatRooms)
    private readonly chatRoomRepository: Repository<ChatRooms>,
    @InjectRepository(ChatMembers)
    private readonly chatMemberRepository: Repository<ChatMembers>,
    @InjectRepository(RecruitPosts)
    private readonly recruitPostRepository: Repository<RecruitPosts>,
    @InjectRepository(RecruitApplies)
    private readonly recruitApplyRepository: Repository<RecruitApplies>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    private readonly configService: ConfigService,
  ) {}
  MY_SECRET_KEY = this.configService.get<string>('MY_SECRET_KEY');
  handleAccessTokenBearer(accessTokenBearer) {
    const accessToken = accessTokenBearer.split(' ')[1];
    try {
      return jwt.verify(accessToken, this.MY_SECRET_KEY).sub as string;
    } catch (err) {
      throw new Error(err);
    }
  }

  async handleConnection(client: Socket, accessTokenBearer: string) {
    if (!accessTokenBearer) {
      return {
        status: 'failure',
        data: 'accessTokenRequired',
      };
    }
    try {
      const userId = this.handleAccessTokenBearer(accessTokenBearer);
      client.join(userId as string);
      const notifications = await this.notificationRepository
        .createQueryBuilder('N')
        .leftJoin('N.notificationSender2', 'U')
        .addSelect('U.nickname')
        .where('N.notificationReceiver = :userId', { userId })
        .andWhere('N.isRead = 0')
        .orderBy('N.createdAt', 'DESC')
        .take(20)
        .getMany();
      return {
        status: 'success',
        data: { notifications, EventType },
      };
    } catch (err) {
      return {
        status: 'failure',
        data: err,
      };
    }
  }

  handleDisconnect(client: Socket) {
    client.rooms.clear();
    return {
      status: 'success',
      data: 'disconnected',
    };
  }

  async handleChatRoomEntrance(
    client: Socket,
    chatRoomId: number,
    accessTokenBearer: string,
  ) {
    try {
      const userId = this.handleAccessTokenBearer(accessTokenBearer);
      const isBelonging = await this.chatMemberRepository.findOne({
        where: {
          chatRoomId,
          member: userId,
        },
      });
      if (!isBelonging) {
        return {
          status: 'failure',
          data: 'BadRequest Not Belonging To The Chatroom',
        };
      }

      const source = await this.recruitPostRepository.findOne({
        where: {
          recruitPostId: chatRoomId,
        },
      });

      const chats = await this.chatRepository
        .createQueryBuilder('C')
        .leftJoin('C.speaker2', 'U')
        .addSelect(['U.nickname', 'U.profileImgUrl', 'U.userId'])
        .where('C.chatRoomId = :chatRoomId', { chatRoomId })
        .orderBy('C.chatId', 'ASC')
        .getMany();

      if (!source || source.endAt < new Date()) {
        // 종료된 프로젝트
        return {
          status: 'success',
          data: { chats, isOver: true },
        };
      }

      client.join(String(chatRoomId));
      return {
        status: 'success',
        data: { chats, isOver: false },
      };
    } catch (err) {
      return {
        status: 'failure',
        data: err,
      };
    }
  }

  async handleSubmittedMessage(
    client: Socket,
    server: Server,
    msgToServerDto: MsgToServerDto,
    accessTokenBearer: string,
  ) {
    try {
      const userId = this.handleAccessTokenBearer(accessTokenBearer);
      if (!client.rooms.has(String(msgToServerDto.chatRoomId))) {
        return {
          status: 'failure',
          msgToServerDto: 'Bad Request Must Join The Chatroom First',
        };
      }

      const updated = await this.chatRepository.save(
        this.chatRepository.create({
          chatRoomId: msgToServerDto.chatRoomId,
          speaker: userId,
          chat: msgToServerDto.chat,
        }),
      );
      const user = await this.userRepository.findOne({
        where: {
          userId: userId,
        },
        select: ['nickname', 'profileImgUrl'],
      });

      const chat = {
        chatId: updated.chatId,
        chat: updated.chat,
        speaker: updated.speaker,
        chatRoomId: updated.chatRoomId,
        createdAt: updated.createdAt,
        speaker2: {
          userId,
          nickname: user.nickname,
          profileImgUrl: user.profileImgUrl,
        },
      };

      server
        .to(String(msgToServerDto.chatRoomId))
        .emit(EventServerToClient.msgToClient, {
          chat,
        });

      const notifications = [];
      this.chatMemberRepository
        .createQueryBuilder('M')
        .leftJoin('M.member2', 'U')
        .addSelect(['U.nickname'])
        .getMany()
        .then((crews) => {
          for (const crew of crews) {
            if (crew.member === userId) continue;
            const notification = this.notificationRepository.create({
              notificationSender: userId,
              eventType: EventType.chat,
              eventContent: msgToServerDto.chat.slice(0, 30),
              targetId: msgToServerDto.chatRoomId,
              isRead: false,
              notificationSender2: {
                nickname: msgToServerDto.nickname,
              },
            });
            notification.notificationReceiver = crew.member;
            notifications.push(notification);
          }

          this.notificationRepository
            .save(notifications)
            .then((notifications) => {
              for (const notification of notifications) {
                server
                  .to(notification.notificationReceiver)
                  .emit(EventServerToClient.notificationToClient, notification);
              }
            });
        });
    } catch (err) {
      console.error(err);
      return {
        status: 'failure',
        data: err,
      };
    }
  }

  async handleNotification(
    server: Server,
    createNotificationDto: CreateNotificationDto,
    accessTokenBearer: string,
  ) {
    try {
      createNotificationDto.notificationSender =
        this.handleAccessTokenBearer(accessTokenBearer);

      const notification = this.notificationRepository.create({
        notificationSender: createNotificationDto.notificationSender,
        notificationReceiver: createNotificationDto.notificationReceiver,
        eventType: createNotificationDto.eventType,
        eventContent: createNotificationDto.eventContent,
        targetId: createNotificationDto.targetId,
        isRead: createNotificationDto.isRead,
        notificationSender2: {
          nickname: createNotificationDto.nickname,
        },
      });
      server
        .to(createNotificationDto.notificationReceiver)
        .emit(EventServerToClient.notificationToClient, notification);
      const savedNotifications = await this.notificationRepository.save(
        notification,
      );
      return {
        status: 'success',
        data: savedNotifications,
      };
    } catch (err) {
      return {
        status: 'failure',
        data: err,
      };
    }
  }

  async sendNotification(
    server: Server,
    createNotificationDtos: CreateNotificationDto[],
  ) {
    try {
      const notifications = [];
      for (const createNotificationDto of createNotificationDtos) {
        const notification = this.notificationRepository.create({
          notificationSender: createNotificationDto.notificationSender,
          notificationReceiver: createNotificationDto.notificationReceiver,
          eventType: createNotificationDto.eventType,
          eventContent: createNotificationDto.eventContent,
          targetId: createNotificationDto.targetId,
          isRead: createNotificationDto.isRead,
        });
        notifications.push(notification);
      }
      const savedNotifications = await this.notificationRepository.save(
        notifications,
      );

      for (const idx in savedNotifications) {
        savedNotifications[parseInt(idx)].notificationSender2 = {
          nickname: createNotificationDtos[parseInt(idx)].nickname,
        };
        server
          .to(savedNotifications[parseInt(idx)].notificationReceiver)
          .emit(
            EventServerToClient.notificationToClient,
            savedNotifications[parseInt(idx)],
          );
      }
      return {
        status: 'success',
        data: savedNotifications,
      };
    } catch (err) {
      return {
        status: 'failure',
        data: err,
      };
    }
  }
}
