import { AuthService } from './auth.service';
import { Body, Controller, Post } from '@nestjs/common';

@Controller('login')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('kakao')
  kakaoLoginGetToken(@Body('code') code: string) {
    return this.authService.kakaoLoginGetToken(code);
  }

  @Post('google')
  googleLogin(@Body('code') code: string) {
    return code;
  }

  @Post('github')
  githubLogin(@Body('code') code: string) {
    console.log(code);
    return this.authService.githubLogin(code);
  }
}
