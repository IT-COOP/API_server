import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { InformationPostService } from './information-post.service';
import { CreateInformationPostDto } from './dto/create-information-post.dto';
import { UpdateInformationPostDto } from './dto/update-information-post.dto';

@Controller('information-post')
export class InformationPostController {
  constructor(
    private readonly informationPostService: InformationPostService,
  ) {}

  // 글 전체 보기 - 최신순/좋아요순  //  필터(타입 4가지)
  // 글 하나만 보기
  // 글

  @Post()
  create(@Body() createInformationPostDto: CreateInformationPostDto) {
    return this.informationPostService.create(createInformationPostDto);
  }

  @Get()
  findAll() {
    return this.informationPostService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.informationPostService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateInformationPostDto: UpdateInformationPostDto,
  ) {
    return this.informationPostService.update(+id, updateInformationPostDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.informationPostService.remove(+id);
  }
}
