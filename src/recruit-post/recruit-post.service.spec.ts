import { Test, TestingModule } from '@nestjs/testing';
import { RecruitPostService } from './recruit-post.service';

describe('RecruitPostService', () => {
  let service: RecruitPostService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecruitPostService],
    }).compile();

    service = module.get<RecruitPostService>(RecruitPostService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
