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
import { RecruitPosts } from 'src/recruit-post/entities/RecruitPosts';
import { RecruitApplies } from 'src/recruit-post/entities/RecruitApplies';
import { emit } from 'process';

// 문제 1. 토큰을 받아야 할 것인가 아니면 userId를 직접 받아야 할 것인가?
@WebSocketGateway({ namespace: 'socket' })
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @InjectRepository(Chats)
    private readonly chatRepository: Repository<Chats>,
    @InjectRepository(Chats)
    private readonly chatRoomRepository: Repository<ChatRooms>,
    @InjectRepository(Chats)
    private readonly chatMemberRepository: Repository<ChatMembers>,
    @InjectRepository(RecruitPosts)
    private readonly recruitPostRepository: Repository<RecruitPosts>,
    @InjectRepository(RecruitApplies)
    private readonly recruitApplyRepository: Repository<RecruitApplies>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
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

    const check = await this.chatMemberRepository.findOne({
      where: {
        member: data.userId,
        chatRoomId: data.chatRoomId,
      },
    });

    if (!check) {
      return "Wrong Request User Don't Belong In The Chatroom";
    }
    if (!client.rooms.has(String(data.chatRoomId))) {
      return 'Bad Request Must Join Chatroom First';
    }

    const savedChat = await this.chatRepository.save(
      this.chatRepository.create({
        chatRoomId: data.chatRoomId,
        speaker: data.userId,
        chat: data.chat,
      }),
    );

    const chat = this.chatRepository.find({
      where: { chatId: savedChat.chatId },
      take: 1,
      relations: ['speaker2'],
      order: {
        chatId: 'DESC',
      },
    });

    // 해당 chatRoom에 입장한 상태인지 판별 먼저 한다.
    client.to(String(data.chatRoomId)).emit('msgToClient', chat);
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

    const check = this.chatMemberRepository.find({
      where: {
        chatRoomId: data.chatRoomId,
        member: data.userId,
      },
    });

    if (!check) {
      return 'bad request';
    }

    const newest = await this.chatMemberRepository.find({
      where: {
        member: data.userId,
      },
      order: {
        chatRoomId: 'DESC',
      },
      take: 1,
    });

    // 또한, 채팅 로그는 보여줄 수 있지만, 완성된 프로젝트의 경우에는 다시 참가할 수는 없어야 한다.

    const chats = await this.chatRepository.find({
      where: { chatRoomId: data.chatRoomId },
      relations: ['speaker2'],
    });

    if (newest[0].chatRoomId !== data.chatRoomId) {
      // endAt이 createdAt과 다르고, 이미 지난 경우도 추가해야함.
      return {
        isNew: false,
        chats,
      };
    }

    client.join(String(data.chatRoomId));
    return {
      isNew: true,
      chats,
    };
  }

  @SubscribeMessage('createChatRoom')
  async createChatRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: CreateChatRoomDto,
  ) {
    // data = {
    //   userId: userId[],
    // }

    const newChatRoom = await this.chatRoomRepository.save(
      this.chatRoomRepository.create({
        participantCount: data.userId.length,
      }),
    );

    const values = [];
    for (const user in data.userId) {
      values.push({
        chatRoomId: newChatRoom.chatRoomId,
        member: user,
      });
    }

    await this.chatMemberRepository.insert(values);

    client.join(String(newChatRoom.chatRoomId));
    // 최초에 채팅방을 만드는 기능을 구현해야 한다.
    // db에다가 만들어서 chatroomId를 돌려주면 될 것 같음.

    return String(newChatRoom.chatRoomId);
  }

  handleConnection(@ConnectedSocket() client: Socket) {
    client.leave(client.id); // << 이 기능은 추후 notification 기능을 고려하면 필요 없을 듯???
    // 연결이 되었을 때,
    // 유저는 이미 자기 채팅방을 알고 있어야 함.
    // 다른 채팅 서비스에서 닉네임을 올려준 것과 마찬가지로 채팅방을 올려줌
    // 해당 채팅방 Room에 유저를 넣어주면 됨.
    return 'connected';
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    client.rooms.clear();
    // 연결이 끊어졌을 때
    // 연결이 끊어져도 이 사람은 다음에 또 왔을 때 같은 채팅방에 들어가야함.
    // 혹은 새로운 것이 생기더라도, 이것은 DB에서 긁어와서 해야함.
    // 또한, 정상적으로 disconnected event가 발생하지 않고 연결이 끊어지는 경우도 많을 것임.
    // 우리는 관계 없을 듯?
    return 'disconnected';
  }

  @SubscribeMessage('notificationConnect')
  async handleNotificationConnect(
    @ConnectedSocket() client: Socket,
    @MessageBody() userId: string,
  ) {
    client.rooms.clear();
    client.join(userId);
    const notifications = this.notificationRepository.find({
      where: {
        notificationReceiver: userId,
      },
    });
    return notifications;
  }

  @SubscribeMessage('notification')
  async handleNotification(
    @ConnectedSocket() client: Socket,
    @MessageBody() data,
  ) {
    const result = await this.notificationRepository.save(
      this.notificationRepository.create({
        notificationReceiver: data.notificationReceiver,
        notificationSender: data.notificationSender,
        eventType: data.eventType,
        eventContent: data.eventContent,
        targetId: data.targetId,
        isRead: false,
      }),
    );

    client.to(data.notificationReceiver).emit('notification', {
      notificationSender: data.notificationSender,
      eventType: data.eventType,
      eventContent: data.eventContent,
      targetId: data.targetId,
    });
    return result;
  }
}

// 채팅방에 대응하는 새로운 모듈을 만든다.
// 그냥 오면 그 사람이 연결할 수 있는 채팅방을 보여준다.
// 그 사람이 채팅방을 누르면, 채팅방에 접속한다.
// 채팅방에 접속하면, 그 채팅방에 지금까지 쌓인 채팅들을 보여준다.
// 그 사람이 채팅을 하면, 연결된 소켓 서버를 통해 그 채팅방에 있는 사람들에게 메시지를 띄워주면서 DB에 해당 채팅을 저장한다.
