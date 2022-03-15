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

  @Column('int', { name: 'commentDepth', nullable: true })
  commentDepth: number | null;

  @Column('int', { name: 'commentGroup', nullable: true })
  commentGroup: number | null;

  @Column('varchar', { name: 'userId', length: 50 })
  userId: string;

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
    { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
  )
  @JoinColumn([
    { name: 'informationPostId', referencedColumnName: 'informationPostId' },
  ])
  informationPost: InformationPosts;

  @ManyToOne(() => Users, (users) => users.informationComments, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'userId', referencedColumnName: 'userId' }])
  user: Users;
}
