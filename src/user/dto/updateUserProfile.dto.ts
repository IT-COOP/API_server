import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateUserProfileDTO {
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
