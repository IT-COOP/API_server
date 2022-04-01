import { ValidationPipe } from '@nestjs/common';
import {
  EventClientToServer,
  EventServerToClient,
} from './../common/socket.event';
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

  async handleConnection(@ConnectedSocket() client: Socket) {
    console.log('connected To socket');
    const accessTokenBearer = client.handshake.headers.authorization;
    client.emit(
      EventServerToClient.notificationToClient,
      await this.socketService.handleConnection(client, accessTokenBearer),
    );
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log(client.id);
    return this.socketService.handleDisconnect(client);
  }

  @SubscribeMessage(EventClientToServer.msgToServer)
  async handleSubmittedMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody(ValidationPipe) mstToServerDto: MsgToServerDto,
  ) {
    const accessTokenBearer = client.handshake.headers.authorization;
    return await this.socketService.handleSubmittedMessage(
      client,
      this.server,
      mstToServerDto,
      accessTokenBearer,
    );
  }

  @SubscribeMessage(EventClientToServer.enterChatRoom)
  async handleChatRoomEntrance(
    @ConnectedSocket() client: Socket,
    @MessageBody(ValidationPipe) chatRoomId: number,
  ) {
    const accessTokenBearer = client.handshake.headers.authorization;
    return await this.socketService.handleChatRoomEntrance(
      client,
      chatRoomId,
      accessTokenBearer,
    );
  }

  @SubscribeMessage(EventClientToServer.createChatRoom)
  async handleCreateChatRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody(ValidationPipe) recruitPostId: number,
  ) {
    const accessTokenBearer = client.handshake.headers.authorization;
    return await this.socketService.handleCreateChatRoom(
      client,
      this.server,
      recruitPostId,
      accessTokenBearer,
    );
  }

  @SubscribeMessage(EventClientToServer.notificationToServer)
  async handleNotification(
    @ConnectedSocket() client: Socket,
    @MessageBody(ValidationPipe) createNotificationDto: CreateNotificationDto,
  ) {
    const accessTokenBearer = client.handshake.headers.authorization;
    return await this.socketService.handleNotification(
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
