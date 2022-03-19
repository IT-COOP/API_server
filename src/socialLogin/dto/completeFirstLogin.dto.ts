import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CompleteFirstLoginDTO {
  @IsNotEmpty()
  @IsString()
  @MaxLength(30)
  @MinLength(2)
  nickname: string;

  @IsString()
  technologyStack: string | undefined;

  @IsString()
  selfIntroduction: string | undefined;

  @IsString()
  portfolioUrl: string | undefined;

  @IsString()
  profileImgUrl: string | undefined;
}
