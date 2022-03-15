import { IsString, IsNumber, MaxLength, MinLength } from 'class-validator';

export class CompleteFirstLoginDTO {
  @MaxLength(13)
  @MinLength(2)
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
