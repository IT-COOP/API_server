import {
  IsEmail,
  IsString,
  IsNumber,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CompleteFirstLoginDTO {
  @IsEmail()
  userId: string;

  @MaxLength(13)
  @MinLength(4)
  @IsString()
  nickname: string;

  @IsString()
  profileImgUrl: string;

  @IsString()
  technologyStack: string;

  @IsNumber()
  activityPoint: number;

  @IsString()
  selfIntroduction: string;

  @IsString()
  portfolioUrl: string;
}

// export class Users {
//   @Column('varchar', { primary: true, name: 'userId', length: 100 })
//   userId: string;

//   @Column('varchar', { name: 'nickname', nullable: true, length: 100 })
//   nickname: string | null;

//   @Column('varchar', { name: 'profileImgUrl', nullable: true, length: 100 })
//   profileImgUrl: string | null;

//   @Column('varchar', { name: 'technologyStack', nullable: true, length: 100 })
//   technologyStack: string | null;

//   @Column('int', { name: 'activityPoint', nullable: true })
//   activityPoint: number | null;

//   @Column('varchar', { name: 'selfIntroduction', nullable: true, length: 100 })
//   selfIntroduction: string | null;

//   @Column('varchar', { name: 'portfolioUrl', nullable: true, length: 100 })
//   portfolioUrl: string | null;

//   @Column('varchar', { name: 'password', nullable: true, length: 100 })
//   password: string | null;

//   @Column('int', { name: 'loginType', nullable: true })
//   loginType: number | null;

//   // Unique로 이름 변경
//   @Column('varchar', { name: 'loginToken', nullable: true, length: 100 })
//   indigenousKey: string | null;

//   @Column('varchar', { name: 'refreshToken', nullable: true })
//   refreshToken: string | null;

//   @Column('tinyint', { name: 'isValid', nullable: true, width: 1 })
//   isValid: boolean | null;

//   @CreateDateColumn()
//   createdAt: Date;

//   @UpdateDateColumn()
//   updatedAt: Date;
// }
