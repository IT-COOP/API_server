import { Controller, Get } from '@nestjs/common';
import { RecruitPostService } from './recruit-post.service';

@Controller('recruit')
export class RecruitPostController {
  constructor(private readonly recruitPostService: RecruitPostService) {


    @Get()
    async getAllRecruits(@Query() query: any) {
      query;
    // const order = query.order;
    // const items = query.items ? query.items : 12;
    // const location = query.location;
    // const task = query.task;
    // const stack = query.stack;
    // const lastId = query.lastId;

    console.log('서비스 전');

    const recruits = await this.recruitService
      .ReadAllRecruits
      // userId,
      // order,
      // items,
      // location,
      // task,
      // stack,
      // lastId,
      ();

    const post = recruits.map((item: any) => {
      const obj: any = item;
      obj.recruitDurationWeeks = item.recruitDurationDays / 7;
      return obj;
    });

    return post;
    }
  }
}
