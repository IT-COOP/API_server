import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RecruitPostService } from './recruit-post.service';
import { CreateRecruitPostDto } from './dto/create-recruit-post.dto';
import { UpdateRecruitPostDto } from './dto/update-recruit-post.dto';

@Controller('recruit-post')
export class RecruitPostController {
  constructor(private readonly recruitPostService: RecruitPostService) {}

  @Post()
  create(@Body() createRecruitPostDto: CreateRecruitPostDto) {
    return this.recruitPostService.create(createRecruitPostDto);
  }

  @Get()
  findAll() {
    return this.recruitPostService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.recruitPostService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRecruitPostDto: UpdateRecruitPostDto,
  ) {
    return this.recruitPostService.update(+id, updateRecruitPostDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.recruitPostService.remove(+id);
  }
}
