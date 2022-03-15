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
@Entity('informationKeeps', { schema: 'test' })
export class InformationKeeps {
  @PrimaryGeneratedColumn({
    type: 'int',
    name: 'informationKeepId',
    unsigned: true,
  })
  informationKeepId: number;

  @Column('varchar', { name: 'userId', length: 50 })
  userId: string;

  @Column('int', { name: 'informationPostId', unsigned: true })
  informationPostId: number;

  @Column('timestamp', {
    name: 'createdAt',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date | null;

  @ManyToOne(
    () => InformationPosts,
    (informationPosts) => informationPosts.informationKeeps,
    { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
  )
  @JoinColumn([
    { name: 'informationPostId', referencedColumnName: 'informationPostId' },
  ])
  informationPost: InformationPosts;

  @ManyToOne(() => Users, (users) => users.informationKeeps, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'userId', referencedColumnName: 'userId' }])
  user: Users;
}
