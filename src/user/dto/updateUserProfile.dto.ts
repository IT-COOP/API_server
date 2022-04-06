import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({
    description: '닉네임',
  })
  nickname: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: '기술 스택',
  })
  technologyStack: string;

  @IsOptional()
  @IsUrl()
  @ApiProperty({
    description: '프로필 이미지 url',
  })
  profileImgUrl: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: '자기 소개 글',
  })
  selfIntroduction: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  @ApiProperty({
    description: '포트폴리오 url',
  })
  portfolioUrl: string;
}
