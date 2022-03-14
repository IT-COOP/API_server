import { Column, CreateDateColumn, Entity, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class Users {
  @Column('varchar', { primary: true, name: 'userId', length: 100 })
  userId: string;

  @Column('varchar', { name: 'nickname', length: 30, default: '' })
  nickname: string | null;

  // default 값 기본 이미지로 수정 예정
  @Column('varchar', { name: 'profileImgUrl', default: '' })
  profileImgUrl: string;

  @Column('varchar', { name: 'technologyStack', default: '', length: 100 })
  technologyStack: string | null;

  @Column('int', { name: 'activityPoint', default: 0 })
  activityPoint: number;

  @Column('varchar', { name: 'selfIntroduction', default: '' })
  selfIntroduction: string;

  @Column('varchar', { name: 'portfolioUrl', default: '' })
  @Column('int', { name: 'loginType', nullable: false })
  loginType: number;

  // Unique로 이름 변경
  @Column('varchar', { name: 'indigenousKey', unique: true })
  indigenousKey: string;

  @Column('varchar', { name: 'refreshToken', default: '' })
  refreshToken: string;

  @Column('tinyint', {
    name: 'isValid',
    width: 1,
    default: true,
  })
  isValid: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
