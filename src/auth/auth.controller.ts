import { AuthService } from './auth.service';
import { Body, Controller, Post } from '@nestjs/common';

@Controller('login')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('kakao')
  kakaoLogin(@Body('code') code: string) {
    return this.authService.kakaoLogin(code); // 고민의 잔재
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
