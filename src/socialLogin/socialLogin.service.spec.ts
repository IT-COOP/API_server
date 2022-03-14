import { Test, TestingModule } from '@nestjs/testing';
import { SocialLoginService } from './socialLogin.service';

describe('SocialLoginService', () => {
  let service: SocialLoginService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SocialLoginService],
    }).compile();

    service = module.get<SocialLoginService>(SocialLoginService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
