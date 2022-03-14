import { CompleteFirstLoginDTO } from './dto/completeFirstLogin.dto';
import { SocialLoginService } from './socialLogin.service';
import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';

@Controller('login')
export class SocialLoginController {
  constructor(private readonly socialLoginService: SocialLoginService) {}
  @Get('kakao')
  kakaoLoginGetToken(@Query('code') code: string, @Res() res: Response) {
    return this.socialLoginService.getKakaoToken(code, res);
  }

  @Get('google')
  googleLogin(@Query('code') code: string, @Res() res: Response) {
    return this.socialLoginService.getGoogleToken(code, res);
  }

  @Get('github')
  githubLogin(@Query('code') code: string, @Res() res: Response) {
    console.log(code);
    return this.socialLoginService.getGithubToken(code, res);
  }

  @Post('completion')
  firstLogin(
    @Headers('authorization') payload: string,
    @Body() body: CompleteFirstLoginDTO,
  ) {
    return this.socialLoginService.completeFirstLogin(
      payload.split(' ')[1],
      body,
    );
  }

  @Get('validation')
  userValidation(
    @Headers('authorization') accessTokenBearer: string,
    @Headers('refreshToken') refreshTokenBearer: string,
  ) {
    console.log('여기는 와써용');
    console.log('accessToken', accessTokenBearer);
    console.log('refreshToken', refreshTokenBearer);
    refreshTokenBearer = refreshTokenBearer ? refreshTokenBearer : '';
    return this.socialLoginService.userValidation(
      accessTokenBearer.split(' ')[1],
      refreshTokenBearer.split(' ')[1],
    );
  }
}
