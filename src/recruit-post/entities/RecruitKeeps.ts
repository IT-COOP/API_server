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
@Entity('recruitKeeps')
export class RecruitKeeps {
  @PrimaryGeneratedColumn({
    type: 'int',
    name: 'recruitKeepId',
    unsigned: true,
  })
  recruitKeepId: number;

  @Column('varchar', { name: 'userId', length: 50 })
  userId: string;

  @Column('int', { name: 'recruitPostId', unsigned: true })
  recruitPostId: number;

  @Column('timestamp', {
    name: 'createdAt',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date | null;

  @ManyToOne(() => RecruitPosts, (recruitPosts) => recruitPosts.recruitKeeps, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([
    { name: 'recruitPostId', referencedColumnName: 'recruitPostId' },
  ])
  recruitPost: RecruitPosts;

  @ManyToOne(() => Users, (users) => users.recruitKeeps, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'userId', referencedColumnName: 'userId' }])
  user: Users;
}
