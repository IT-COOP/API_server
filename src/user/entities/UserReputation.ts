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

  @Column('varchar', { name: 'userReputationSender', length: 50 })
  userReputationSender: string;

  @Column('varchar', { name: 'userReputationReceiver', length: 50 })
  userReputationReceiver: string;

  @Column('tinyint', { name: 'userReputationPoint', nullable: true, width: 1 })
  userReputationPoint: boolean | null;

  @Column('int', { name: 'recruitPostId', unsigned: true })
  recruitPostId: number;

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
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([
    { name: 'userReputationSender', referencedColumnName: 'userId' },
  ])
  userReputationSender2: Users;

  @ManyToOne(() => Users, (users) => users.userReputations2, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([
    { name: 'userReputationReceiver', referencedColumnName: 'userId' },
  ])
  userReputationReceiver2: Users;

  @ManyToOne(
    () => RecruitPosts,
    (recruitPosts) => recruitPosts.userReputations,
    { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
  )
  @JoinColumn([
    { name: 'recruitPostId', referencedColumnName: 'recruitPostId' },
  ])
  recruitPost: RecruitPosts;
}
