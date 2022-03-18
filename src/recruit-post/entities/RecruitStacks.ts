import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RecruitPosts } from './RecruitPosts';

@Index('recruitPostId', ['recruitPostId'], {})
@Entity('recruitStacks')
export class RecruitStacks {
  @PrimaryGeneratedColumn({
    type: 'int',
    name: 'recruitTaskId',
    unsigned: true,
  })
  recruitTaskId: number;

  @Column('int', { name: 'recruitPostId', unsigned: true })
  recruitPostId: number;

  @Column('int', { name: 'recruitStack', nullable: true })
  recruitStack: number | null;

  @Column('int', { name: 'numberOfPeopleRequired', nullable: true })
  numberOfPeopleRequired: number | null;

  @Column('int', { name: 'numberOfPeopleSet', nullable: true })
  numberOfPeopleSet: number | null;

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

  @ManyToOne(() => RecruitPosts, (recruitPosts) => recruitPosts.recruitStacks, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([
    { name: 'recruitPostId', referencedColumnName: 'recruitPostId' },
  ])
  recruitPost: RecruitPosts;
}
