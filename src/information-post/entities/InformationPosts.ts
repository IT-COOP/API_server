import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { InformationComments } from './InformationComments';
import { InformationKeeps } from './InformationKeeps';
import { InformationLoves } from './InformationLoves';
import { InformationPostImages } from './InformationPostImages';
import { Users } from '../../socialLogin/entity/Users';

@Index('userId', ['author'], {})
@Entity('informationPosts', { schema: 'test' })
export class InformationPosts {
  @PrimaryGeneratedColumn({
    type: 'int',
    name: 'informationPostId',
    unsigned: true,
  })
  informationPostId: number;

  @Column('varchar', { name: 'title', nullable: true, length: 100 })
  title: string | null;

  @Column('varchar', { name: 'author', nullable: true, length: 50 })
  author: string | null;

  @Column('varchar', {
    name: 'informationContent',
    nullable: true,
    length: 255,
  })
  informationContent: string | null;

  @Column('int', {
    name: 'informationKeepCount',
    nullable: true,
    unsigned: true,
    default: () => 0,
  })
  informationKeepCount: number | null;

  @Column('int', {
    name: 'informationLoveCount',
    nullable: true,
    unsigned: true,
    default: () => 0,
  })
  informationLoveCount: number | null;

  @Column('int', {
    name: 'informationCommentCount',
    nullable: true,
    unsigned: true,
    default: () => 0,
  })
  informationCommentCount: number | null;

  @Column('int', {
    name: 'viewCount',
    nullable: true,
    unsigned: true,
    default: () => 0,
  })
  viewCount: number | null;

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

  @OneToMany(
    () => InformationComments,
    (informationComments) => informationComments.informationPost,
  )
  informationComments: InformationComments[];

  @OneToMany(
    () => InformationKeeps,
    (informationKeeps) => informationKeeps.informationPost,
  )
  informationKeeps: InformationKeeps[];

  @OneToMany(
    () => InformationLoves,
    (informationLoves) => informationLoves.informationPost,
  )
  informationLoves: InformationLoves[];

  @OneToMany(
    () => InformationPostImages,
    (informationPostImages) => informationPostImages.informationPost,
  )
  informationPostImages: InformationPostImages[];

  @ManyToOne(() => Users, (users) => users.informationPosts, {
    onDelete: 'CASCADE',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([{ name: 'author', referencedColumnName: 'userId' }])
  author2: Users;
}
