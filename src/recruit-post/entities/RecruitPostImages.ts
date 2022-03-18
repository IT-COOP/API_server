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
@Entity('recruitPostImages')
export class RecruitPostImages {
  @PrimaryGeneratedColumn({
    type: 'int',
    name: 'recruitPostImageId',
    unsigned: true,
  })
  recruitPostImageId: number;

  @Column('int', { name: 'recruitPostId', nullable: true, unsigned: true })
  recruitPostId: number | null;

  @Column('varchar', { name: 'imgUrl', nullable: true, length: 255 })
  imgUrl: string | null;

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
    (recruitPosts) => recruitPosts.recruitPostImages,
    { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
  )
  @JoinColumn([
    { name: 'recruitPostId', referencedColumnName: 'recruitPostId' },
  ])
  recruitPost: RecruitPosts;
}
