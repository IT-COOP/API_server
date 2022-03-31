import { ValidationPipe } from '@nestjs/common';
import { EventClientToServer } from './../common/socket.event';
import { SocketService } from './socket.service';
import { MsgToServerDto } from './dto/msgToServer.dto';
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

@WebSocketGateway({ namespace: 'socket', cors: true })
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly socketService: SocketService) {}
  @WebSocketServer()
  public server: Server;

  handleConnection(@ConnectedSocket() client: Socket) {
    console.log('connected To socket');
    console.log(client.handshake.headers);
    const accessTokenBearer = client.handshake.headers.authorization;
    return this.socketService.handleConnection(client, accessTokenBearer);
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    return this.socketService.handleDisconnect(client);
  }

  @SubscribeMessage(EventClientToServer.msgToServer)
  handleSubmittedMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody(ValidationPipe) mstToServerDto: MsgToServerDto,
  ) {
    const accessTokenBearer = client.handshake.headers.authorization;
    return this.socketService.handleSubmittedMessage(
      client,
      this.server,
      mstToServerDto,
      accessTokenBearer,
    );
  }

  @SubscribeMessage(EventClientToServer.enterChatRoom)
  handleChatRoomEntrance(
    @ConnectedSocket() client: Socket,
    @MessageBody(ValidationPipe) chatRoomId: number,
  ) {
    const accessTokenBearer = client.handshake.headers.authorization;
    return this.socketService.handleChatRoomEntrance(
      client,
      chatRoomId,
      accessTokenBearer,
    );
  }

  @SubscribeMessage(EventClientToServer.createChatRoom)
  handleCreateChatRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody(ValidationPipe) recruitPostId: number,
  ) {
    const accessTokenBearer = client.handshake.headers.authorization;
    return this.socketService.handleCreateChatRoom(
      client,
      this.server,
      recruitPostId,
      accessTokenBearer,
    );
  }

  @SubscribeMessage(EventClientToServer.notificationToServer)
  handleNotification(
    @ConnectedSocket() client: Socket,
    @MessageBody(ValidationPipe) createNotificationDto: CreateNotificationDto,
  ) {
    const accessTokenBearer = client.handshake.headers.authorization;
    return this.socketService.handleNotification(
      this.server,
      createNotificationDto,
      accessTokenBearer,
    );
  }

  sendNotification(createNotificationDto: CreateNotificationDto) {
    return this.socketService.sendNotification(
      this.server,
      createNotificationDto,
    );
  }
}
