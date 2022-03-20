import { Users } from './../socialLogin/entity/Users';
import { RecruitApplies } from './../recruit-post/entities/RecruitApplies';
import { RecruitPosts } from './../recruit-post/entities/RecruitPosts';
import { Notification } from './../user/entities/Notification';
import { CreateChatRoomDto } from './dto/createChatRoom.dto';
import { MsgToServerDto } from './dto/msgToServer.dto';
import { EnterChatRoomDto } from './dto/enterChatRoom.dto';
import { ChatMembers } from './entities/ChatMembers';
import { ChatRooms } from './entities/ChatRooms';
import { Chats } from './entities/Chats';
import { InjectRepository } from '@nestjs/typeorm';
import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Repository } from 'typeorm';
import { CreateNotificationDto } from './dto/createNotification.dto';

/**
 * 목표 골조 : 최초에 모집이 완료되었을 때, 채팅방을 생성해준다.
 * 현재 골조 : 아직 완성하지 못하였다.
 */
// 문제 1. 토큰을 받아야 할 것인가 아니면 userId를 직접 받아야 할 것인가?
@WebSocketGateway({ namespace: 'socket' })
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
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
  @WebSocketServer()
  public server: Server;

  /**
   * 클라이언트에서 메시지를 보내는 기능
   * event 이름은 msgToServer
   * chatRoomId를 recruitPostId로 1:1 대응을 시키고, 이에 대해서 참가 여부를 판별하는 것으로 해야한다.
   */
  @SubscribeMessage('msgToServer')
  async handleSubmittedMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: MsgToServerDto,
  ) {
    // data = {
    //   chatRoomId: chatRoomId,
    //   userId: userId,
    //   chat: chat
    // }
    if (client.rooms.has(String(data.chatRoomId))) {
      return 'Bad Request Must Join The Chatroom First';
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

    // 알림을 추가해야함.
    // 다른 member들에게.
    //

    const crews = await this.chatMemberRepository.find({
      where: { chatRoomId: data.chatRoomId },
      select: ['member'],
    });
    const instances = [];
    const notification: CreateNotificationDto = {
      notificationSender: data.userId,
      notificationReceiver: '',
      eventType: 7,
      eventContent: data.chat.slice(0, 30),
      targetId: data.chatRoomId,
      isRead: false,
    };

    for (const crew of crews) {
      if (crew.member === data.userId) continue;
      notification.notificationReceiver = crew.member;
      client.to(crew.member).emit('notificationToClient', notification);
      instances.push(notification);
    }

    await this.notificationRepository.insert(instances);

    client.to(String(data.chatRoomId)).emit('msgToClient', {
      profileImgUrl: user.profileImgUrl,
      nickname: user.nickname,
      userId: data.userId,
      chat: data.chat,
    });
    // 여기서 DB에 메시지 저장하고, 연결된 Room에 있는 사람들에게 emit시켜주는 기능을 구현해야함.
    // 해당 Room에 존재하는 사람들 모두에게 방송해주는 것도 구현해야함. 아마도 to emit?

    // 문제 1. 누가 발화하였는 지 어떻게 판별할 것인가?
    return data;
  }

  /**
   * 채팅방 처음에 입장하는 기능
   * event 이름은 enterChatRoom
   */
  @SubscribeMessage('enterChatRoom')
  async handleChatRoomEntrance(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: EnterChatRoomDto,
  ) {
    // data = {
    //   chatRoomId: chatRoomId,
    //   userId: userId,
    // }
    const isBelonging = await this.chatMemberRepository.count({
      where: {
        chatRoomId: data.chatRoomId,
        member: data.userId,
      },
    });
    if (!isBelonging) {
      return 'BadRequest Not Authorized';
    }
    // 해당 채팅방이 실존하고, 이 사람도 거기 속해있음.

    const source = await this.recruitPostRepository.findOne({
      where: {
        recruitPostId: data.chatRoomId,
      },
    });

    if (!source) {
      // 그런 글 없습니다.
      return 'Such Project Does Not Exist';
    }
    if (source.endAt === source.createdAt) {
      // 아직 시작도 안함!
      return 'Project Not Yet Begun';
    }

    const chats = await this.chatRepository.find({
      where: { chatRoomId: data.chatRoomId },
      relations: ['speaker2'],
    });

    if (source.endAt < new Date()) {
      // 종료된 프로젝트
      return { chats, isOver: true };
    }

    client.join(String(data.chatRoomId));
    return { chats, isOver: false };
  }

  @SubscribeMessage('createChatRoom')
  async createChatRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: CreateChatRoomDto,
  ) {
    // data = {
    //   userId: userId,
    //   recruitPostId: recruitPostId
    // }

    const recruitPost = await this.recruitPostRepository.findOne({
      where: {
        recruitPostId: data.recruitPostId,
      },
    });

    const isAlreadyPresent = await this.chatRoomRepository.findOne({
      where: {
        chatRoomId: recruitPost.recruitPostId,
      },
    });

    if (
      recruitPost && // 게시글도 있고, endAt default가 createdAt이랑 같으니까 이게 다르면 시작한 걸로 봅니다.
      recruitPost.createdAt !== recruitPost.endAt &&
      recruitPost.endAt <= new Date() && // 이게 아직 끝나지 않았는 지를 판별합니다.
      recruitPost.author === data.userId && // 게시글 작성자만 할 수 있습니다.
      !isAlreadyPresent // 채팅방이 이미 존재하면 안됩니다.
    ) {
      // 여기는 만들어줘도 됨
      const newChatRoom = await this.chatRoomRepository.save(
        this.chatRoomRepository.create({
          chatRoomId: data.recruitPostId,
        }),
      );

      const crews = await this.recruitApplyRepository.find({
        select: ['applicant'], // 사실 이게 어떻게 작동할 지는 모르겠지만....;; 작성자는 apply하지 않아도 이미 포함된 사람이니까용
        where: {
          recruitPostId: data.recruitPostId,
          isAccepted: true,
        },
      }); // 넵

      const instances = [
        {
          member: recruitPost.author,
          chatRoomId: data.recruitPostId,
        },
      ]; // author도 넣어야 함/ << 여기서 넣어주면 될 것 같습니다.
      for (const crew of crews) {
        instances.push({
          member: crew.applicant,
          chatRoomId: data.recruitPostId,
        });
      } // 여기 부분이 좀 불완전한 것 같네요... 나중에 고치겠습니다.
      await this.chatMemberRepository.insert(instances); // << 여기에 object의 array가 와야 하니까
      client.join(String(data.recruitPostId));
      return String(newChatRoom.chatRoomId);
    } else {
      // 여기는 꺼지라고 하면 됨.
      return 'Bad Request Validation Failure';
    }
  }

  handleConnection(@ConnectedSocket() client: Socket) {
    // << 이 기능은 추후 notification 기능을 고려하면 필요 없을 듯???
    client.to(client.id).emit('requestingNotificationConnect');
    // 연결이 되었을 때,
    // 유저는 이미 자기 채팅방을 알고 있어야 함.
    // 다른 채팅 서비스에서 닉네임을 올려준 것과 마찬가지로 채팅방을 올려줌
    // 해당 채팅방 Room에 유저를 넣어주면 됨.
    return 'connected';
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    client.rooms.clear();
    return 'disconnected';
  }

  @SubscribeMessage('notificationConnect')
  async handleNotificationConnect(
    @ConnectedSocket() client: Socket,
    @MessageBody() userId: string,
  ) {
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
    return notifications;
  }

  @SubscribeMessage('notificationToServer') // 누군가가 뭔 짓을 하면 프론트에서 이런 이벤트를 emit시키라고 요구할 겁니다. << 이게 좀 아닌 것 같음..
  async handleNotification(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: CreateNotificationDto,
  ) {
    // data = {
    //   notificationReceiver: notificationReceiver,
    //   notificationSender: notificationSender,
    //   eventType: eventType, << 이 친구 enum도 정해줘야 겠군요
    //   eventContent: eventContent,
    //   targetId: targetId,
    //   isRead: false,
    // }
    const result = await this.notificationRepository.insert(data);

    client.to(data.notificationReceiver).emit('notificationToClient', data);
    return result;
  }
}
