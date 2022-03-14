import { Test, TestingModule } from '@nestjs/testing';
import { SocialLoginController } from './socialLogin.controller';

describe('SocialLoginController', () => {
  let controller: SocialLoginController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SocialLoginController],
    }).compile();

    controller = module.get<SocialLoginController>(SocialLoginController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
