import { IsInt, IsString, Max, Min } from 'class-validator';

export class RateUserDto {
  @IsString()
  receiver: string;

  @IsInt()
  @Max(1)
  @Min(0)
  point: number;

  @IsInt()
  recruitPostId: number;
}
