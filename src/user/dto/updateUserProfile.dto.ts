import {
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateUserProfileDTO {
  @IsOptional()
  @MaxLength(8)
  @MinLength(2)
  @IsString()
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
