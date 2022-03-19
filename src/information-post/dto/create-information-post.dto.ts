import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
export class CreateInformationPostDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  title: string;

  @IsNotEmpty()
  @IsString()
  informationContent: string;

  @IsOptional()
  @IsString({ each: true })
  ImgUrl;
}
