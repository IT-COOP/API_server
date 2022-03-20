import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ChatMembers } from './ChatMembers';
import { Chats } from './Chats';

@Entity('chatRooms', { schema: 'test' })
export class ChatRooms {
  @PrimaryGeneratedColumn({ type: 'int', name: 'chatRoomId', unsigned: true })
  chatRoomId: number;

  @Column('timestamp', {
    name: 'createdAt',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date | null;

  @OneToMany(() => ChatMembers, (chatMembers) => chatMembers.chatRoom)
  chatMembers: ChatMembers[];

  @OneToMany(() => Chats, (chats) => chats.chatRoom)
  chats: Chats[];
}
