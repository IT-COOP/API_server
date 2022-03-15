import { Test, TestingModule } from '@nestjs/testing';
import { InformationPostController } from './information-post.controller';
import { InformationPostService } from './information-post.service';

describe('InformationPostController', () => {
  let controller: InformationPostController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InformationPostController],
      providers: [InformationPostService],
    }).compile();

    controller = module.get<InformationPostController>(InformationPostController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
