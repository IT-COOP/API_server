import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNumber, IsString } from 'class-validator';
import { Region } from 'src/common/enums';
import { RecruitStacks } from '../entities/RecruitStacks';
import { RecruitTasks } from '../entities/RecruitTasks';

//주의 사항 프로젝트 기간을 주로 받아 일로 변환해 db에 저장하기 프로젝트 종료 시간을 구하기 위해
export class RecruitPostDTO {
  @ApiProperty({
    example: '좋은 테스트 코드 짜는 방법',
    description: '타이틀',
  })
  @IsString()
  public title: string;

  @ApiProperty({
    example: 'IT COOP 화이팅!',
    description: '글 내용',
  })
  @IsString()
  public recruitContent: string;

  @ApiProperty({
    example: 101,
    description: '지역에 대한 번호',
  })
  @IsEnum(Region)
  public recruitLocation: number;

  @ApiProperty({
    example: 7,
    description: '프로젝트 기간 1 ~ 12',
  })
  @IsNumber()
  public recruitDurationWeek: number;

  @ApiProperty({
    example: '이미지 url',
    description: '프로젝트 이미지 url',
  })
  @IsString()
  public imgUrl: string;

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
  @IsArray()
  public recruitStacks: RecruitStacks[];

  @ApiProperty({
    example: [
      { recruitTask: 300, numberOfPeopleRequired: 3, numberOfPeopleSet: 0 },
    ],
    description: '직무별 필요 인원',
  })
  @IsArray()
  public recruitTasks: RecruitTasks[];
}
