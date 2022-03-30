import { ValidationPipe } from '@nestjs/common';
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
  handleSubmittedMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody(ValidationPipe) mstToServerDto: MsgToServerDto,
  ) {
    return this.socketService.handleSubmittedMessage(
      client,
      this.server,
      mstToServerDto,
    );
  }

  @SubscribeMessage(EventClientToServer.enterChatRoom)
  handleChatRoomEntrance(
    @ConnectedSocket() client: Socket,
    @MessageBody(ValidationPipe) enterChatRoomDto: EnterChatRoomDto,
  ) {
    return this.socketService.handleChatRoomEntrance(client, enterChatRoomDto);
  }

  @SubscribeMessage(EventClientToServer.createChatRoom)
  handleCreateChatRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody(ValidationPipe) createChatRoomDto: CreateChatRoomDto,
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
  handleNotificationConnect(
    @ConnectedSocket() client: Socket,
    @MessageBody() userId: string,
  ) {
    return this.socketService.handleNotificationConnect(client, userId);
  }

  @SubscribeMessage(EventClientToServer.notificationToServer)
  handleNotification(
    @ConnectedSocket() client: Socket,
    @MessageBody(ValidationPipe) createNotificationDto: CreateNotificationDto,
  ) {
    return this.socketService.handleNotification(
      client,
      this.server,
      createNotificationDto,
    );
  }

  sendNotification(createNotificationDto: CreateNotificationDto) {
    return this.socketService.sendNotification(
      this.server,
      createNotificationDto,
    );
  }
}
