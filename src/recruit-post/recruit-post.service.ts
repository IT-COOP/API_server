import { Injectable } from '@nestjs/common';
import { CreateRecruitPostDto } from './dto/create-recruit-post.dto';
import { UpdateRecruitPostDto } from './dto/update-recruit-post.dto';

@Injectable()
export class RecruitPostService {
  create(createRecruitPostDto: CreateRecruitPostDto) {
    return 'This action adds a new recruitPost';
  }

  findAll() {
    return `This action returns all recruitPost`;
  }

  findOne(id: number) {
    return `This action returns a #${id} recruitPost`;
  }

  update(id: number, updateRecruitPostDto: UpdateRecruitPostDto) {
    return `This action updates a #${id} recruitPost`;
  }

  remove(id: number) {
    return `This action removes a #${id} recruitPost`;
  }
}
