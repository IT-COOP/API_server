import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ChatMembers } from './ChatMembers';
import { RecruitPosts } from '../../recruit-post/entities/RecruitPosts';
import { Chats } from './Chats';

@Entity('chatRooms', { schema: 'test' })
export class ChatRooms {
  @PrimaryGeneratedColumn({ type: 'int', name: 'chatRoomId', unsigned: true })
  chatRoomId: number;

  @Column('int', { name: 'participantCount', nullable: true, unsigned: true })
  participantCount: number | null;

  @Column('timestamp', {
    name: 'createdAt',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date | null;

  @Column('tinyint', { name: 'isValid', nullable: true, width: 1 })
  isValid: boolean | null;

  @OneToMany(() => ChatMembers, (chatMembers) => chatMembers.chatRoom)
  chatMembers: ChatMembers[];

  @OneToOne(() => RecruitPosts, (recruitPosts) => recruitPosts.chatRooms, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'chatRoomId', referencedColumnName: 'recruitPostId' }])
  chatRoom: RecruitPosts;

  @OneToMany(() => Chats, (chats) => chats.chatRoom)
  chats: Chats[];
}
