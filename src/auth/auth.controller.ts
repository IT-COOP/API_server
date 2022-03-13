import { CompleteFirstLoginDTO } from './dto/completeFirstLogin.dto';
import { AuthService } from './auth.service';
import { Body, Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
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

  @Post('completion')
  completeFirstLogin(@Req() req, @Body() body: CompleteFirstLoginDTO) {
    return this.completeFirstLogin(req.id, body);
  }
}
