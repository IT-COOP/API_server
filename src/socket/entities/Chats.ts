import { Users } from 'src/socialLogin/entity/Users';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ChatRooms } from './ChatRooms';

@Index('speaker', ['speaker'], {})
@Index('chatRoomId', ['chatRoomId'], {})
@Entity('chats', { schema: 'test' })
export class Chats {
  @PrimaryGeneratedColumn({ type: 'int', name: 'chatId', unsigned: true })
  chatId: number;

  @Column('int', { name: 'chatRoomId', nullable: true, unsigned: true })
  chatRoomId: number | null;

  @Column('varchar', { name: 'speaker', length: 50 })
  speaker: string;

  @Column('text', { name: 'chat' })
  chat: string;

  @Column('timestamp', {
    name: 'createdAt',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date | null;

  @ManyToOne(() => Users, (users) => users.userId, {
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([{ name: 'speaker', referencedColumnName: 'userId' }])
  speaker2: Users;

  @ManyToOne(() => ChatRooms, (chatRooms) => chatRooms.chats, {
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([{ name: 'chatRoomId', referencedColumnName: 'chatRoomId' }])
  chatRoom: ChatRooms;
}
