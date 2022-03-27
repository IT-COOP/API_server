export enum EventClientToServer {
  msgToServer = 'msgToServer',
  enterChatRoom = 'enterChatRoom',
  createChatRoom = 'createChatRoom',
  notificationConnect = 'notificationConnect',
  notificationToServer = 'notificationToServer',
}

export enum EventServerToClient {
  notificationToClient = 'notificationToClient',
  msgToClient = 'msgToClient',
  requestingNotificationConnect = 'requestingNotificationConnect',
}
