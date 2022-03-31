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
        .select('U.nickname')
        .where('N.notificationReceiver = :userId', { userId })
        .orderBy('N.notificationId', 'DESC')
        .take(20)
        .getMany();
      console.log(notifications);
      return { status: 'success', data: { notifications, EventType } };
    } catch (err) {
      console.error(err);
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
          status: 'success',
          data: 'BadRequest Not Belonging To The Chatroom',
        };
      }

      const source = await this.recruitPostRepository.findOne({
        where: {
          recruitPostId: chatRoomId,
        },
      });

      const chats = await this.chatRepository.find({
        where: { chatRoomId },
        relations: ['speaker2'],
      });

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

  async handleCreateChatRoom(
    client: Socket,
    server: Server,
    recruitPostId: number,
    accessTokenBearer: string,
  ) {
    try {
      const userId = this.handleAccessTokenBearer(accessTokenBearer);
      const recruitPost = await this.recruitPostRepository.findOne({
        where: {
          recruitPostId: recruitPostId,
        },
      });

      const isAlreadyPresent = await this.chatRoomRepository.findOne({
        where: {
          chatRoomId: recruitPost.recruitPostId,
        },
      });

      if (
        recruitPost &&
        recruitPost.createdAt !== recruitPost.endAt &&
        recruitPost.endAt <= new Date() &&
        recruitPost.author === userId &&
        !isAlreadyPresent
      ) {
        const newChatRoom = await this.chatRoomRepository.save(
          this.chatRoomRepository.create({
            chatRoomId: recruitPostId,
          }),
        );

        const crews = await this.recruitApplyRepository.find({
          select: ['applicant'],
          where: {
            recruitPostId: recruitPostId,
            isAccepted: true,
          },
        });
        const notifications = [];
        // notification 추가하고 DB에 올려야함
        const chatMembers = [
          {
            member: recruitPost.author,
            chatRoomId: recruitPostId,
          },
        ];
        for (const crew of crews) {
          const notification = this.notificationRepository.create({
            notificationSender: recruitPost.author,
            notificationReceiver: crew.applicant,
            eventType: EventType.chatRoomCreation,
            eventContent: '새로운 채팅방이 생겼어요!',
            targetId: recruitPostId,
            isRead: false,
          });
          chatMembers.push({
            member: crew.applicant,
            chatRoomId: recruitPostId,
          });
          notifications.push(notification);
          server
            .to(crew.applicant)
            .emit(EventServerToClient.notificationToClient, notification);
        }
        await this.chatMemberRepository.insert(chatMembers);
        await this.notificationRepository.insert(notifications);
        client.join(String(recruitPostId));
        return {
          status: 'success',
          data: String(newChatRoom.chatRoomId),
        };
      } else {
        return {
          status: 'failure',
          data: 'Bad Request Validation Failure',
        };
      }
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

      await this.chatRepository.save(
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
      });

      const notifications = [];
      const notification: CreateNotificationDto = {
        notificationSender: userId,
        notificationReceiver: '',
        eventType: EventType.chat,
        eventContent: msgToServerDto.chat.slice(0, 30),
        targetId: msgToServerDto.chatRoomId,
        isRead: false,
      };

      const crews = await this.chatMemberRepository.find({
        where: { chatRoomId: msgToServerDto.chatRoomId },
        select: ['member'],
      });
      for (const crew of crews) {
        if (crew.member === userId) continue;
        notification.notificationReceiver = crew.member;
        server
          .to(crew.member)
          .emit(EventServerToClient.notificationToClient, notification);
        notifications.push(notification);
      }

      await this.notificationRepository.insert(notifications);

      server
        .to(String(msgToServerDto.chatRoomId))
        .emit(EventServerToClient.msgToClient, {
          profileImgUrl: user.profileImgUrl,
          nickname: user.nickname,
          userId: userId,
          chat: msgToServerDto.chat,
        });
      return {
        status: 'success',
        data: {
          profileImgUrl: user.profileImgUrl,
          nickname: user.nickname,
          userId: userId,
          chat: msgToServerDto.chat,
        },
      };
    } catch (err) {
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

      const result = await this.notificationRepository.insert(
        createNotificationDto,
      );
      server
        .to(createNotificationDto.notificationReceiver)
        .emit(EventServerToClient.notificationToClient, createNotificationDto);
      return {
        status: 'success',
        data: result,
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
    createNotificationDto: CreateNotificationDto,
  ) {
    const result = await this.notificationRepository.insert(
      createNotificationDto,
    );
    server
      .to(createNotificationDto.notificationReceiver)
      .emit(EventServerToClient.notificationToClient, createNotificationDto);
    return {
      status: 'success',
      data: result,
    };
  }
}
