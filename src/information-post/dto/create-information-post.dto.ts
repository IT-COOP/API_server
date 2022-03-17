import { IsString } from 'class-validator';
export class CreateInformationPostDto {
  @IsString()
  title: string;

  @IsString()
  author: string;

  @IsString()
  informationContent: string;
}
