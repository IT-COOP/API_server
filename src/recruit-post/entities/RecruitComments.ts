import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RecruitPosts } from './RecruitPosts';
import { Users } from '../../socialLogin/entity/Users';

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

  @Column('int', { name: 'commentDepth', nullable: true })
  commentDepth: number | null;

  @Column('int', { name: 'commentGroup', nullable: true })
  commentGroup: number | null;

  @Column('varchar', { name: 'userId', length: 50 })
  userId: string;

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

  @ManyToOne(
    () => RecruitPosts,
    (recruitPosts) => recruitPosts.recruitComments,
    { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
  )
  @JoinColumn([
    { name: 'recruitPostId', referencedColumnName: 'recruitPostId' },
  ])
  recruitPost: RecruitPosts;

  @ManyToOne(() => Users, (users) => users.recruitComments, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'userId', referencedColumnName: 'userId' }])
  user: Users;
}
