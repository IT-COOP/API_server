import { Test, TestingModule } from '@nestjs/testing';
import { InformationPostService } from './information-post.service';

describe('InformationPostService', () => {
  let service: InformationPostService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InformationPostService],
    }).compile();

    service = module.get<InformationPostService>(InformationPostService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
