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

  @Get('validation')
  userValidation(
    @Headers('authorization') accessTokenBearer: string,
    @Headers('refreshToken') refreshTokenBearer: string,
  ) {
    return this.socialLoginService.userValidation(
      accessTokenBearer,
      refreshTokenBearer,
    );
  }

  @Post('completion')
  firstLogin(
    @Headers('authorization') accessTokenBearer: string,
    @Body() body: CompleteFirstLoginDTO,
  ) {
    console.log(accessTokenBearer);
    return this.socialLoginService.completeFirstLogin(accessTokenBearer, body);
  }
}
