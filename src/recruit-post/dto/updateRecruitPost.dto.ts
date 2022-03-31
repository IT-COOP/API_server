import { ApiProperty } from '@nestjs/swagger';

export class UpdateDetailPostsDTO {
  @ApiProperty({
    example: '좋은 테스트 코드 짜는 방법',
    description: '타이틀',
  })
  public title: string;

  @ApiProperty({
    example: 'IT COOP 화이팅!',
    description: '글 내용',
  })
  public recruitContent: string;

  @ApiProperty({
    example: 1,
    description: '지역에 대한 번호',
  })
  public recruitLocation: number;

  @ApiProperty({
    example: 7,
    description: '프로젝트 기간 1 ~ 12',
  })
  public recruitDurationWeek: number;

  @ApiProperty({
    example: '이미지 url',
    description: '프로젝트 이미지 url',
  })
  public imgUrl: string;
}
