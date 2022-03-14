import { Column, CreateDateColumn, Entity, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class Users {
  @Column('varchar', { primary: true, name: 'userId', length: 100 })
  userId: string;

  @Column('varchar', { name: 'nickname', length: 100, default: '' })
  nickname: string | null;

  // default 값 기본 이미지로 수정 예정
  @Column('varchar', { name: 'profileImgUrl', length: 100, default: '' })
  profileImgUrl: string;

  @Column('varchar', { name: 'technologyStack', nullable: true, length: 100 })
  technologyStack: string | null;

  @Column('int', { name: 'activityPoint', nullable: true })
  activityPoint: number | null;

  @Column('varchar', { name: 'selfIntroduction', nullable: true, length: 100 })
  selfIntroduction: string | null;

  @Column('varchar', { name: 'portfolioUrl', nullable: true, length: 100 })
  portfolioUrl: string | null;

  @Column('int', { name: 'loginType', nullable: true })
  loginType: number | null;

  // Unique로 이름 변경
  @Column('varchar', { name: 'indigenousKey', nullable: true, length: 100 })
  indigenousKey: string | null;

  @Column('varchar', { name: 'refreshToken', nullable: true })
  refreshToken: string | null;

  @Column('tinyint', { name: 'isValid', nullable: true, width: 1 })
  isValid: boolean | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
