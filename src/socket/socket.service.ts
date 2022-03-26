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
import { EnterChatRoomDto } from './dto/enterChatRoom.dto';
import { CreateChatRoomDto } from './dto/createChatRoom.dto';
import { EventType } from './enum/eventType.enum';

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
  ) {}
  async handleSubmittedMessage(
    client: Socket,
    server: Server,
    data: MsgToServerDto,
  ) {
    if (!client.rooms.has(String(data.chatRoomId))) {
      return {
        status: 'failure',
        data: 'Bad Request Must Join The Chatroom First',
      };
    }

    await this.chatRepository.save(
      this.chatRepository.create({
        chatRoomId: data.chatRoomId,
        speaker: data.userId,
        chat: data.chat,
      }),
    );
    const user = await this.userRepository.findOne({
      where: {
        userId: data.userId,
      },
    });

    const notifications = [];
    const notification: CreateNotificationDto = {
      notificationSender: data.userId,
      notificationReceiver: '',
      eventType: EventType.chat,
      eventContent: data.chat.slice(0, 30),
      targetId: data.chatRoomId,
      isRead: false,
    };

    const crews = await this.chatMemberRepository.find({
      where: { chatRoomId: data.chatRoomId },
      select: ['member'],
    });
    for (const crew of crews) {
      if (crew.member === data.userId) continue;
      notification.notificationReceiver = crew.member;
      server
        .to(crew.member)
        .emit(EventServerToClient.notificationToClient, notification);
      notifications.push(notification);
    }

    await this.notificationRepository.insert(notifications);

    server.to(String(data.chatRoomId)).emit(EventServerToClient.msgToClient, {
      profileImgUrl: user.profileImgUrl,
      nickname: user.nickname,
      userId: data.userId,
      chat: data.chat,
    });
    return {
      status: 'success',
      data,
    };
  }

  async handleChatRoomEntrance(
    client: Socket,
    enterChatRoomDto: EnterChatRoomDto,
  ) {
    const isBelonging = await this.chatMemberRepository.findOne({
      where: {
        chatRoomId: enterChatRoomDto.chatRoomId,
        member: enterChatRoomDto.userId,
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
        recruitPostId: enterChatRoomDto.chatRoomId,
      },
    });

    const chats = await this.chatRepository.find({
      where: { chatRoomId: enterChatRoomDto.chatRoomId },
      relations: ['speaker2'],
    });

    if (source.endAt < new Date()) {
      // 종료된 프로젝트
      return {
        status: 'success',
        data: { chats, isOver: true },
      };
    }

    client.join(String(enterChatRoomDto.chatRoomId));
    return {
      status: 'success',
      data: { chats, isOver: false },
    };
  }

  async createChatRoom(
    client: Socket,
    server: Server,
    enterChatRoomDto: CreateChatRoomDto,
  ) {
    const recruitPost = await this.recruitPostRepository.findOne({
      where: {
        recruitPostId: enterChatRoomDto.recruitPostId,
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
      recruitPost.author === enterChatRoomDto.userId &&
      !isAlreadyPresent
    ) {
      const newChatRoom = await this.chatRoomRepository.save(
        this.chatRoomRepository.create({
          chatRoomId: enterChatRoomDto.recruitPostId,
        }),
      );

      const crews = await this.recruitApplyRepository.find({
        select: ['applicant'],
        where: {
          recruitPostId: enterChatRoomDto.recruitPostId,
          isAccepted: true,
        },
      });
      const notifications = [];
      // notification 추가하고 DB에 올려야함
      const chatMembers = [
        {
          member: recruitPost.author,
          chatRoomId: enterChatRoomDto.recruitPostId,
        },
      ];
      for (const crew of crews) {
        const notification = this.notificationRepository.create({
          notificationSender: recruitPost.author,
          notificationReceiver: crew.applicant,
          eventType: EventType.chatRoomCreation,
          eventContent: '새로운 채팅방이 생겼어요!',
          targetId: enterChatRoomDto.recruitPostId,
          isRead: false,
        });
        chatMembers.push({
          member: crew.applicant,
          chatRoomId: enterChatRoomDto.recruitPostId,
        });
        notifications.push(notification);
        server
          .to(crew.applicant)
          .emit(EventServerToClient.notificationToClient, notification);
      }
      await this.chatMemberRepository.insert(chatMembers);
      await this.notificationRepository.insert(notifications);
      client.join(String(enterChatRoomDto.recruitPostId));
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
  }

  handleConnection(client: Socket) {
    client
      .to(client.id)
      .emit(EventServerToClient.requestingNotificationConnect);
    return {
      status: 'success',
      data: 'connected',
    };
  }

  handleDisconnect(client: Socket) {
    client.rooms.clear();
    return {
      status: 'success',
      data: 'disconnected',
    };
  }

  async handleNotificationConnect(client: Socket, userId: string) {
    client.join(userId);
    const notifications = this.notificationRepository.find({
      where: {
        notificationReceiver: userId,
        isRead: false,
      },
      take: 20,
      order: {
        notificationId: 'DESC',
      },
    });
    return { status: 'success', data: { notifications, EventType } };
  }

  async handleNotification(
    client: Socket,
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
