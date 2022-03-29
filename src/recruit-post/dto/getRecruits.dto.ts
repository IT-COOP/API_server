import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumberString } from 'class-validator';
import { Location, Stacks, Tasks } from 'src/common/enums';
import { over, sort } from '../enums/recruit.enums';

export class GetRecruitsDTO {
  @ApiProperty({
    example: '0',
    description: 'sort',
  })
  @IsEnum(sort)
  public sort: string;

  @ApiProperty({
    example: '0',
    description: 'items',
  })
  @IsNumberString()
  public items: string;

  @ApiProperty({
    example: '101',
    description: 'loc',
  })
  @IsNumberString(Location)
  public loc: string;

  @ApiProperty({
    example: '300',
    description: '직군 정보',
  })
  @IsNumberString(Tasks)
  public task: string;

  @ApiProperty({
    example: '301',
    description: 'stack',
  })
  @IsEnum(Stacks)
  public stack: string;

  @ApiProperty({
    example: '4',
    description: '아이디',
  })
  @IsNumberString()
  public cur: string;

  @ApiProperty({
    example: '0',
    description: 'over',
  })
  @IsEnum(over)
  public over: string;
}
