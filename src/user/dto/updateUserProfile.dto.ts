import {
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateUserProfileDTO {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(6)
  nickname: string;

  @IsOptional()
  @IsString()
  technologyStack: string;

  @IsOptional()
  @IsUrl()
  profileImgUrl;

  @IsOptional()
  @IsString()
  selfIntroduction: string;

  @IsOptional()
  @IsString()
  portfolioUrl: string;
}
