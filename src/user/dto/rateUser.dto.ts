import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Max, Min } from 'class-validator';

export class RateUserDto {
  @IsString()
  @ApiProperty({
    description: '평가를 받는 사람 userId',
  })
  receiver: string;

  @IsInt()
  @Max(1)
  @Min(0)
  @ApiProperty({
    description: '평가 점수',
  })
  point: number;

  @IsInt()
  @ApiProperty({
    description: '함께 진행한 프로젝트',
  })
  recruitPostId: number;
}
