import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MaxLength,
  MinLength,
  IsOptional,
  IsUrl,
} from 'class-validator';

export class CompleteFirstLoginDTO {
  @ApiProperty({
    example: 'T없E맑은I',
    description: '사용자 닉네임',
  })
  @IsString()
  @MaxLength(8)
  @MinLength(2)
  nickname: string;

  @ApiProperty({
    example: 'https://itcoop.s3.ap-northeast-2.amazonaws.com/og_new.jpg',
    description: '프로필 이미지 사진. URL 형식이 요구됩니다. 없을 수 있습니다.',
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  profileImgUrl: string;

  @ApiProperty({
    example: '100,101,201',
    description: '문자열로 받아 바로 업로드됩니다. 없을 수 있습니다.',
  })
  @IsOptional()
  @IsString()
  technologyStack: string;

  @ApiProperty({
    example: '저는 뭘 잘하고 무슨 경력이 있고 이런 걸 해봤습니다.',
    description: '문자열로 받아 바로 업로드됩니다. 없을 수 있습니다.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  selfIntroduction: string;

  @ApiProperty({
    example: 'https://github.com/aaa22220304',
    description:
      '문자열로 받아 바로 업로드됩니다. URL 형식이 요구됩니다. 없을 수 있습니다..',
  })
  @IsOptional()
  @IsString()
  portfolioUrl: string;
}
