import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Users } from '../../socialLogin/entity/Users';
import { RecruitPosts } from './RecruitPosts';

@Index('recruitPostId', ['recruitPostId'], {})
@Index('userId', ['userId'], {})
@Entity('recruitComments', { schema: 'test' })
export class RecruitComments {
  @PrimaryGeneratedColumn({
    type: 'int',
    name: 'recruitCommentId',
    unsigned: true,
  })
  recruitCommentId: number;

  @Column('int', { name: 'commentDepth', nullable: true, unsigned: true })
  commentDepth: number | null;

  @Column('int', { name: 'commentGroup', nullable: true, unsigned: true })
  commentGroup: number | null;

  @Column('varchar', { name: 'userId', nullable: true, length: 50 })
  userId: string | null;

  @Column('int', { name: 'recruitPostId', unsigned: true })
  recruitPostId: number;

  @Column('varchar', {
    name: 'recruitCommentContent',
    nullable: true,
    length: 100,
  })
  recruitCommentContent: string | null;

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

  @ManyToOne(() => Users, (users) => users.recruitComments, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'userId', referencedColumnName: 'userId' }])
  user: Users;

  @ManyToOne(
    () => RecruitPosts,
    (recruitPosts) => recruitPosts.recruitComments,
    { onDelete: 'CASCADE', onUpdate: 'CASCADE' },
  )
  @JoinColumn([
    { name: 'recruitPostId', referencedColumnName: 'recruitPostId' },
  ])
  recruitPost: RecruitPosts;
}
