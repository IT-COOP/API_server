import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Users } from '../../socialLogin/entity/Users';
import { RecruitPosts } from '../../recruit-post/entities/RecruitPosts';

@Index('recruitPostId', ['recruitPostId'], {})
@Index('userReputationReceiver', ['userReputationReceiver'], {})
@Index('userReputationSender', ['userReputationSender'], {})
@Entity('userReputation', { schema: 'test' })
export class UserReputation {
  @PrimaryGeneratedColumn({
    type: 'int',
    name: 'userReputationId',
    unsigned: true,
  })
  userReputationId: number;

  @Column('varchar', {
    name: 'userReputationSender',
    nullable: true,
    length: 50,
  })
  userReputationSender: string | null;

  @Column('varchar', { name: 'userReputationReceiver', length: 50 })
  userReputationReceiver: string;

  @Column('tinyint', { name: 'userReputationPoint', width: 1 })
  userReputationPoint: boolean;

  @Column('int', { name: 'recruitPostId', nullable: true, unsigned: true })
  recruitPostId: number | null;

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

  @ManyToOne(() => Users, (users) => users.userReputations, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([
    { name: 'userReputationSender', referencedColumnName: 'userId' },
  ])
  userReputationSender2: Users;

  @ManyToOne(
    () => RecruitPosts,
    (recruitPosts) => recruitPosts.userReputations,
    { onDelete: 'SET NULL', onUpdate: 'CASCADE' },
  )
  @JoinColumn([
    { name: 'recruitPostId', referencedColumnName: 'recruitPostId' },
  ])
  recruitPost: RecruitPosts;

  @ManyToOne(() => Users, (users) => users.userReputations2, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([
    { name: 'userReputationReceiver', referencedColumnName: 'userId' },
  ])
  userReputationReceiver2: Users;
}
