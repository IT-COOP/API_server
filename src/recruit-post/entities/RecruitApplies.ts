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

@Index('applicant', ['applicant'], {})
@Index('recruitPostId', ['recruitPostId'], {})
@Entity('recruitApplies', { schema: 'test' })
export class RecruitApplies {
  @PrimaryGeneratedColumn({
    type: 'int',
    name: 'recruitApplyId',
    unsigned: true,
  })
  recruitApplyId: number;

  @Column('int', { name: 'recruitPostId', unsigned: true })
  recruitPostId: number;

  @Column('varchar', { name: 'applicant', length: 50 })
  applicant: string;

  @Column('int', { name: 'task', nullable: true })
  task: number | null;

  @Column('varchar', { name: 'applyMessage', nullable: true, length: 100 })
  applyMessage: string | null;

  @Column('tinyint', { name: 'isAccepted', nullable: true, width: 1 })
  isAccepted: boolean | null;

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
    (recruitPosts) => recruitPosts.recruitApplies,
    { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
  )
  @JoinColumn([
    { name: 'recruitPostId', referencedColumnName: 'recruitPostId' },
  ])
  recruitPost: RecruitPosts;

  @ManyToOne(() => Users, (users) => users.recruitApplies, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'applicant', referencedColumnName: 'userId' }])
  applicant2: Users;
}
