import { Injectable } from '@nestjs/common';
import { CreateInformationPostDto } from './dto/create-information-post.dto';
import { UpdateInformationPostDto } from './dto/update-information-post.dto';

@Injectable()
export class InformationPostService {
  create(createInformationPostDto: CreateInformationPostDto) {
    return 'This action adds a new informationPost';
  }

  findAll() {
    return `This action returns all informationPost`;
  }

  findOne(id: number) {
    return `This action returns a #${id} informationPost`;
  }

  update(id: number, updateInformationPostDto: UpdateInformationPostDto) {
    return `This action updates a #${id} informationPost`;
  }

  remove(id: number) {
    return `This action removes a #${id} informationPost`;
  }
}
