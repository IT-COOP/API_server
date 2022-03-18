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
@Entity('recruitPostImages', { schema: 'test' })
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

  @ManyToOne(
    () => RecruitPosts,
    (recruitPosts) => recruitPosts.recruitPostImages,
    { onDelete: 'CASCADE', onUpdate: 'CASCADE' },
  )
  @JoinColumn([
    { name: 'recruitPostId', referencedColumnName: 'recruitPostId' },
  ])
  recruitPost: RecruitPosts;
}
