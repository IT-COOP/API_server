import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ChatRooms } from '../../socket/entities/ChatRooms';
import { RecruitApplies } from './RecruitApplies';
import { RecruitComments } from './RecruitComments';
import { RecruitKeeps } from './RecruitKeeps';
import { Users } from '../../socialLogin/entity/Users';
import { RecruitStacks } from './RecruitStacks';
import { RecruitTasks } from './RecruitTasks';
import { UserReputation } from '../../user/entities/UserReputation';

@Index('userId', ['author'], {})
@Entity('recruitPosts', { schema: 'test' })
export class RecruitPosts {
  @PrimaryGeneratedColumn({
    type: 'int',
    name: 'recruitPostId',
    unsigned: true,
  })
  recruitPostId: number;

  @Column('varchar', { name: 'title', nullable: true, length: 100 })
  title: string | null;

  @Column('varchar', { name: 'author', nullable: true, length: 50 })
  author: string | null;

  @Column('varchar', { name: 'thumbImgUrl', nullable: true, length: 255 })
  thumbImgUrl: string | null;

  @Column('text', { name: 'recruitContent', nullable: true })
  recruitContent: string | null;

  @Column('int', { name: 'viewCount', nullable: true, unsigned: true })
  viewCount: number | null;

  @Column('int', { name: 'recruitLocation', nullable: true, unsigned: true })
  recruitLocation: number | null;

  @Column('int', { name: 'recruitKeepCount', nullable: true, unsigned: true })
  recruitKeepCount: number | null;

  @Column('int', {
    name: 'recruitCommentCount',
    nullable: true,
    unsigned: true,
  })
  recruitCommentCount: number | null;

  @Column('int', {
    name: 'recruitDurationDays',
    nullable: true,
    unsigned: true,
  })
  recruitDurationDays: number | null;

  @Column('timestamp', {
    name: 'endAt',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  endAt: Date | null;

  @Column('timestamp', {
    name: 'createdAt',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date | null;

  @Column('timestamp', {
    name: 'updatedAt',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date | null;

  @OneToOne(() => ChatRooms, (chatRooms) => chatRooms.chatRoom)
  chatRooms: ChatRooms;

  @OneToMany(
    () => RecruitApplies,
    (recruitApplies) => recruitApplies.recruitPost,
  )
  recruitApplies: RecruitApplies[];

  @OneToMany(
    () => RecruitComments,
    (recruitComments) => recruitComments.recruitPost,
  )
  recruitComments: RecruitComments[];

  @OneToMany(() => RecruitKeeps, (recruitKeeps) => recruitKeeps.recruitPost)
  recruitKeeps: RecruitKeeps[];

  @ManyToOne(() => Users, (users) => users.recruitPosts, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'author', referencedColumnName: 'userId' }])
  author2: Users;

  @OneToMany(() => RecruitStacks, (recruitStacks) => recruitStacks.recruitPost)
  recruitStacks: RecruitStacks[];

  @OneToMany(() => RecruitTasks, (recruitTasks) => recruitTasks.recruitPost)
  recruitTasks: RecruitTasks[];

  @OneToMany(
    () => UserReputation,
    (userReputation) => userReputation.recruitPost,
  )
  userReputations: UserReputation[];
}
