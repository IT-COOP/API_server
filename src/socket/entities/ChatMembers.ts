import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ChatRooms } from './ChatRooms';
import { Users } from './../../../output/entities/Users';
import { Chats } from './Chats';

@Index('chatRoomId', ['chatRoomId'], {})
@Index('member', ['member'], {})
@Entity('chatMembers', { schema: 'test' })
export class ChatMembers {
  @PrimaryGeneratedColumn({ type: 'int', name: 'memberId', unsigned: true })
  memberId: number;

  @Column('int', { name: 'chatRoomId', unsigned: true })
  chatRoomId: number;

  @Column('varchar', { name: 'member', length: 50 })
  member: string;

  @Column('timestamp', {
    name: 'createdAt',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date | null;

  @ManyToOne(() => ChatRooms, (chatRooms) => chatRooms.chatMembers, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'chatRoomId', referencedColumnName: 'chatRoomId' }])
  chatRoom: ChatRooms;

  @ManyToOne(() => Users, (users) => users.chatMembers, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'member', referencedColumnName: 'userId' }])
  member2: Users;

  @OneToMany(() => Chats, (chats) => chats.speaker2)
  chats: Chats[];
}
