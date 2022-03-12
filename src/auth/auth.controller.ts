import { AuthService } from './auth.service';
import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('login')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Get('kakao')
  kakaoLoginGetToken(@Query('code') code: string, @Res() res: Response) {
    return this.authService.getKakaoToken(code, res);
  }

  @Get('google')
  googleLogin(@Query('code') code: string, @Res() res: Response) {
    return this.authService.getGoogleToken(code, res);
  }

  @Get('github')
  githubLogin(@Query('code') code: string, @Res() res: Response) {
    console.log(code);
    return this.authService.getGithubToken(code, res);
  }

  @Post('refresh')
  getRefreshToken(@Param('Authorization') Authorization: string) {
    const refreshToken = Authorization.split(' ')[1];
    return this.authService.getNovelAccessToken(refreshToken);
  }

  // @Post('novelUser')
  // novelUserRegister(@Param('Authorization'))

  @Get('google/token')
  getGoogleToken(@Param() param, @Body() body, @Query() query) {
    console.log(param, body, query);
  }

  @Get('test')
  testLogin(@Res() res: Response) {
    return res.redirect(
      `https://accounts.google.com/o/oauth2/v2/auth?client_id=608654268789-laflmuqietchnqdcrrdpm57gmpe0g0l7.apps.googleusercontent.com&redirect_uri=http://seungmin.shop/login/google&response_type=code&include_granted_scopes=true&scope=https://www.googleapis.com/auth/userinfo.email`,
    );
  }
}
