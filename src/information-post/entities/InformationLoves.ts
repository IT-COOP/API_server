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
    (informationPosts) => informationPosts.informationLoves,
    { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
  )
  @JoinColumn([
    { name: 'informationPostId', referencedColumnName: 'informationPostId' },
  ])
  informationPost: InformationPosts;

  @ManyToOne(() => Users, (users) => users.informationLoves, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'userId', referencedColumnName: 'userId' }])
  user: Users;
}
