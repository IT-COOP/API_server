import { Test, TestingModule } from '@nestjs/testing';
import { RecruitPostController } from './recruit-post.controller';
import { RecruitPostService } from './recruit-post.service';

describe('RecruitPostController', () => {
  let controller: RecruitPostController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecruitPostController],
      providers: [RecruitPostService],
    }).compile();

    controller = module.get<RecruitPostController>(RecruitPostController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
