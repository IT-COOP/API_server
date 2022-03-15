import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InformationPostService } from './information-post.service';
import { CreateInformationPostDto } from './dto/create-information-post.dto';
import { UpdateInformationPostDto } from './dto/update-information-post.dto';

@Controller('information-post')
export class InformationPostController {
  constructor(private readonly informationPostService: InformationPostService) {}

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
  update(@Param('id') id: string, @Body() updateInformationPostDto: UpdateInformationPostDto) {
    return this.informationPostService.update(+id, updateInformationPostDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.informationPostService.remove(+id);
  }
}
