import { Column, Entity, Index, OneToMany } from 'typeorm';
import { InformationComments } from '../../information-post/entities/InformationComments';
import { InformationKeeps } from '../../information-post/entities/InformationKeeps';
import { InformationLoves } from '../../information-post/entities/InformationLoves';
import { InformationPosts } from '../../information-post/entities/InformationPosts';
import { Notification } from '../../user/entities/Notification';
import { RecruitApplies } from '../../recruit-post/entities/RecruitApplies';
import { RecruitComments } from '../../recruit-post/entities/RecruitComments';
import { RecruitKeeps } from '../../recruit-post/entities/RecruitKeeps';
import { RecruitPosts } from '../../recruit-post/entities/RecruitPosts';
import { UserReputation } from '../../user/entities/UserReputation';

@Index('nickname', ['nickname'], { unique: true })
@Entity('users', { schema: 'test' })
export class Users {
  @Column('varchar', { primary: true, name: 'userId', length: 50 })
  userId: string;

  @Column('varchar', {
    name: 'nickname',
    nullable: true,
    unique: true,
    length: 30,
  })
  nickname: string | null;

  @Column('varchar', { name: 'profileImgUrl', nullable: true, length: 255 })
  profileImgUrl: string | null;

  @Column('varchar', { name: 'technologyStack', nullable: true, length: 100 })
  technologyStack: string | null;

  @Column('int', {
    name: 'activityPoint',
    nullable: true,
    default: () => "'0'",
  })
  activityPoint: number | null;

  @Column('text', { name: 'selfIntroduction', nullable: true })
  selfIntroduction: string | null;

  @Column('varchar', { name: 'portfolioUrl', nullable: true, length: 255 })
  portfolioUrl: string | null;

  @Column('int', { name: 'loginType' })
  loginType: number;

  @Column('varchar', { name: 'indigenousKey', length: 255 })
  indigenousKey: string;

  @Column('varchar', { name: 'refreshToken', nullable: true, length: 255 })
  refreshToken: string | null;

  @Column('tinyint', {
    name: 'isValid',
    nullable: true,
    width: 1,
    default: () => "'1'",
  })
  isValid: boolean | null;

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
    (informationComments) => informationComments.user,
  )
  informationComments: InformationComments[];

  @OneToMany(
    () => InformationKeeps,
    (informationKeeps) => informationKeeps.user,
  )
  informationKeeps: InformationKeeps[];

  @OneToMany(
    () => InformationLoves,
    (informationLoves) => informationLoves.user,
  )
  informationLoves: InformationLoves[];

  @OneToMany(
    () => InformationPosts,
    (informationPosts) => informationPosts.user,
  )
  informationPosts: InformationPosts[];

  @OneToMany(
    () => Notification,
    (notification) => notification.notificationReceiver2,
  )
  notifications: Notification[];

  @OneToMany(
    () => Notification,
    (notification) => notification.notificationSender2,
  )
  notifications2: Notification[];

  @OneToMany(
    () => RecruitApplies,
    (recruitApplies) => recruitApplies.applicant2,
  )
  recruitApplies: RecruitApplies[];

  @OneToMany(() => RecruitComments, (recruitComments) => recruitComments.user)
  recruitComments: RecruitComments[];

  @OneToMany(() => RecruitKeeps, (recruitKeeps) => recruitKeeps.user)
  recruitKeeps: RecruitKeeps[];

  @OneToMany(() => RecruitPosts, (recruitPosts) => recruitPosts.user)
  recruitPosts: RecruitPosts[];

  @OneToMany(
    () => UserReputation,
    (userReputation) => userReputation.userReputationSender2,
  )
  userReputations: UserReputation[];

  @OneToMany(
    () => UserReputation,
    (userReputation) => userReputation.userReputationReceiver2,
  )
  userReputations2: UserReputation[];
}
