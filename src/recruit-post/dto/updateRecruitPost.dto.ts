import { ApiProperty } from '@nestjs/swagger';
import { RecruitStacks } from '../entities/RecruitStacks';
import { RecruitTasks } from '../entities/RecruitTasks';
import { RecruitPostDTO } from './recruitPost.dto';

export class UpdateDetailPostsDTO implements RecruitPostDTO {
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

  @ApiProperty({
    example: 'recruitStackId[]',
    description: '스텍에 대한 id값 배열',
  })
  1;
  public recruitStackId: number[];
  @ApiProperty({
    example: [
      {
        recruitStack: 301,
        numberOfPeopleRequired: 3,
        numberOfPeopleSet: 0,
      },
    ],
    description: '프로젝트 사용 기술',
  })
  public recruitStacks: RecruitStacks[];

  @ApiProperty({
    example: 'recruitTaskId[]',
    description: '직무에 대한 id값 배열',
  })
  public recruitTaskId: number[];
  @ApiProperty({
    example: [
      {
        recruitTask: 300,
        numberOfPeopleRequired: 3,
        numberOfPeopleSet: 0,
      },
    ],
    description: '직무별 필요 인원',
  })
  public recruitTasks: RecruitTasks[];
}
