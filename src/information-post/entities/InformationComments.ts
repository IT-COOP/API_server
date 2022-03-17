import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { InformationPosts } from './InformationPosts';
import { Users } from '../../socialLogin/entity/Users';

@Index('informationPostId', ['informationPostId'], {})
@Index('userId', ['userId'], {})
@Entity('informationComments', { schema: 'test' })
export class InformationComments {
  @PrimaryGeneratedColumn({
    type: 'int',
    name: 'informationCommentId',
    unsigned: true,
  })
  informationCommentId: number;

  @Column('int', { name: 'commentDepth', nullable: true, unsigned: true })
  commentDepth: number | null;

  @Column('int', { name: 'commentGroup', nullable: true, unsigned: true })
  commentGroup: number | null;

  @Column('varchar', { name: 'userId', nullable: true, length: 50 })
  userId: string | null;

  @Column('int', { name: 'informationPostId', unsigned: true })
  informationPostId: number;

  @Column('varchar', {
    name: 'informationCommentContent',
    nullable: true,
    length: 100,
  })
  informationCommentContent: string | null;

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
    () => InformationPosts,
    (informationPosts) => informationPosts.informationComments,
    { onDelete: 'CASCADE', onUpdate: 'RESTRICT' },
  )
  @JoinColumn([
    { name: 'informationPostId', referencedColumnName: 'informationPostId' },
  ])
  informationPost: InformationPosts;

  @ManyToOne(() => Users, (users) => users.informationComments, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'userId', referencedColumnName: 'userId' }])
  user: Users;
}
