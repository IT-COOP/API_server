import { IsNumber, IsString, MaxLength, IsNotEmpty } from 'class-validator';
export class CreateInformationCommentDto {
  @IsNumber()
  commentDepth: number;

  @IsNumber()
  commentGroup: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  informationCommentContent: string;
}
