import { IsString, IsNumber, MaxLength, MinLength } from 'class-validator';

export class CompleteFirstLoginDTO {
  @IsString()
  @MaxLength(13)
  @MinLength(2)
  nickname: string;

  @IsString()
  profileImgUrl: string;

  @IsString()
  technologyStack: string;

  @IsNumber()
  activityPoint: number;

  @IsString()
  @MaxLength(300)
  selfIntroduction: string;

  @IsString()
  portfolioUrl: string;
}
