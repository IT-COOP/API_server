import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserProfileDTO {
  @MaxLength(13)
  @MinLength(4)
  @IsString()
  nickname: string;

  @IsString()
  technologyStack: string;

  @IsString()
  selfIntroduction: string;

  @IsString()
  portfolioUrl: string;
}
