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
@Entity('informationLoves', { schema: 'test' })
export class InformationLoves {
  @PrimaryGeneratedColumn({
    type: 'int',
    name: 'informationLoveId',
    unsigned: true,
  })
  informationLoveId: number;

  @Column('varchar', { name: 'userId', nullable: true, length: 50 })
  userId: string | null;

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
    (informationPosts) => informationPosts.informationLoves,
    { onDelete: 'CASCADE', onUpdate: 'CASCADE' },
  )
  @JoinColumn([
    { name: 'informationPostId', referencedColumnName: 'informationPostId' },
  ])
  informationPost: InformationPosts;

  @ManyToOne(() => Users, (users) => users.informationLoves, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'userId', referencedColumnName: 'userId' }])
  user: Users;
}
