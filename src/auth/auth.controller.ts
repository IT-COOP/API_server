import { CompleteFirstLoginDTO } from './dto/completeFirstLogin.dto';
import { AuthService } from './auth.service';
import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';
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
  firstLogin(
    @Param('authorization') payload: string,
    @Body() body: CompleteFirstLoginDTO,
  ) {
    return this.authService.completeFirstLogin(payload.split(' ')[1], body);
  }

  @Get('validation')
  userValidation(
    @Headers() Headers,
    @Body('authorization') accessToken: string,
    @Body('refreshToken') refreshToken: string,
  ) {
    console.log('여기는 와써용');
    console.log(Headers);
    return this.authService.userValidation(
      accessToken.split(' ')[1],
      refreshToken.split(' ')[1],
    );
  }
}
