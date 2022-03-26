import { EventClientToServer } from './../common/socket.event';
import { SocketService } from './socket.service';
import { CreateChatRoomDto } from './dto/createChatRoom.dto';
import { MsgToServerDto } from './dto/msgToServer.dto';
import { EnterChatRoomDto } from './dto/enterChatRoom.dto';
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
import { CreateNotificationDto } from './dto/createNotification.dto';

@WebSocketGateway({ namespace: 'socket' })
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly socketService: SocketService) {}
  @WebSocketServer()
  public server: Server;

  @SubscribeMessage(EventClientToServer.msgToServer)
  async handleSubmittedMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() mstToServerDto: MsgToServerDto,
  ) {
    return this.socketService.handleSubmittedMessage(
      client,
      this.server,
      mstToServerDto,
    );
  }

  @SubscribeMessage(EventClientToServer.enterChatRoom)
  async handleChatRoomEntrance(
    @ConnectedSocket() client: Socket,
    @MessageBody() enterChatRoomDto: EnterChatRoomDto,
  ) {
    return this.socketService.handleChatRoomEntrance(client, enterChatRoomDto);
  }

  @SubscribeMessage(EventClientToServer.createChatRoom)
  async handleCreateChatRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() createChatRoomDto: CreateChatRoomDto,
  ) {
    return this.socketService.handleCreateChatRoom(
      client,
      this.server,
      createChatRoomDto,
    );
  }

  handleConnection(@ConnectedSocket() client: Socket) {
    return this.socketService.handleConnection(client);
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    return this.socketService.handleDisconnect(client);
  }

  @SubscribeMessage(EventClientToServer.notificationConnect)
  async handleNotificationConnect(
    @ConnectedSocket() client: Socket,
    @MessageBody() userId: string,
  ) {
    return this.socketService.handleNotificationConnect(client, userId);
  }

  @SubscribeMessage(EventClientToServer.notificationToServer) // 누군가가 뭔 짓을 하면 프론트에서 이런 이벤트를 emit시키라고 요구할 겁니다. << 이게 좀 아닌 것 같음..
  async handleNotification(
    @ConnectedSocket() client: Socket,
    @MessageBody() createNotificationDto: CreateNotificationDto,
  ) {
    return this.socketService.handleNotification(
      client,
      this.server,
      createNotificationDto,
    );
  }

  async sendNotification(createNotificationDto: CreateNotificationDto) {
    return this.socketService.sendNotification(
      this.server,
      createNotificationDto,
    );
  }
}
