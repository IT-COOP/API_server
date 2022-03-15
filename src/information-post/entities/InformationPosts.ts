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

@Index('userId', ['userId'], {})
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

  @Column('varchar', { name: 'userId', length: 50 })
  userId: string;

  @Column('text', { name: 'informationContent', nullable: true })
  informationContent: string | null;

  @Column('int', { name: 'informationKeepCount', nullable: true })
  informationKeepCount: number | null;

  @Column('int', { name: 'informationLoveCount', nullable: true })
  informationLoveCount: number | null;

  @Column('int', {
    name: 'informationCommentCount',
    nullable: true,
    unsigned: true,
  })
  informationCommentCount: number | null;

  @Column('int', { name: 'viewCount', nullable: true, unsigned: true })
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
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'userId', referencedColumnName: 'userId' }])
  user: Users;
}
