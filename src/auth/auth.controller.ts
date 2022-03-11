import { AuthService } from './auth.service';
import { All, Body, Controller, Param, Post, Query } from '@nestjs/common';

@Controller('login')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('kakao')
  kakaoLoginGetToken(@Body('code') code: string) {
    return this.authService.getKakaoToken(code);
  }

  @Post('google')
  googleLogin(@Body('code') code: string) {
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
}
