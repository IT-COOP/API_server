import { PartialType } from '@nestjs/mapped-types';
import { CreateRecruitPostDto } from './create-recruit-post.dto';

export class UpdateRecruitPostDto extends PartialType(CreateRecruitPostDto) {}
