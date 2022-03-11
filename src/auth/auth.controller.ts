import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import {
  All,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';

@Controller('login')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}
  @Post('kakao')
  kakaoLoginGetToken(@Body('code') code: string) {
    return this.authService.getKakaoToken(code);
  }

  @All('google')
  googleLogin(@Query('code') code: string) {
    return this.authService.getGoogleToken(code);
  }

  @Post('github')
  githubLogin(@Body('code') code: string) {
    console.log(code);
    return this.authService.getGithubToken(code);
  }

  @Post('refresh')
  getRefreshToken(@Param('Authorization') Authorization: string) {
    const refreshToken = Authorization.split(' ')[1];
    return this.authService.getNovelAccessToken(refreshToken);
  }

  // @Post('novelUser')
  // novelUserRegister(@Param('Authorization'))

  @All('google/token')
  getGoogleToken(@Param() param, @Body() body, @Query() query) {
    console.log(param, body, query);
  }

  @Get('test')
  testLogin(@Res() res: Response) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');

    return res.redirect(
      `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=http://localhost:3000/auth/google&response_type=code&include_granted_scopes=true&scope=https://www.googleapis.com/auth/userinfo.email`,
    );
  }
}
