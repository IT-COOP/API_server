import { CompleteFirstLoginDTO } from './dto/completeFirstLogin.dto';
import { SocialLoginService } from './socialLogin.service';
import {
  Body,
  Controller,
  Get,
  Headers,
  HttpException,
  HttpStatus,
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
    console.log('kakao', code);
    return this.socialLoginService.getKakaoToken(code, res);
  }

  @Get('google')
  googleLogin(@Query('code') code: string, @Res() res: Response) {
    console.log('google', code);
    return this.socialLoginService.getGoogleToken(code, res);
  }

  @Get('github')
  githubLogin(@Query('code') code: string, @Res() res: Response) {
    console.log('github', code);
    return this.socialLoginService.getGithubToken(code, res);
  }

  @Post('completion')
  firstLogin(
    @Headers('authorization') payload: string,
    @Body() body: CompleteFirstLoginDTO,
  ) {
    console.log(body);
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
    console.log('accessToken', accessTokenBearer);
    console.log('refreshToken', refreshTokenBearer);
    refreshTokenBearer = refreshTokenBearer ? refreshTokenBearer : '';
    return this.socialLoginService.userValidation(
      accessTokenBearer.split(' ')[1],
      refreshTokenBearer.split(' ')[1],
    );
  }
}
