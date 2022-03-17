import { PartialType } from '@nestjs/mapped-types';
import { CreateInformationPostDto } from './create-information-post.dto';

export class UpdateInformationPostDto extends PartialType(
  CreateInformationPostDto,
) {}
