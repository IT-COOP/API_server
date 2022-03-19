import { CreateInformationCommentDto } from './create-information-comment.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateInformationCommentDto extends PartialType(
  CreateInformationCommentDto,
) {}
