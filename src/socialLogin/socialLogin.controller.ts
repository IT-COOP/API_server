import { CompleteFirstLoginDTO } from './dto/completeFirstLogin.dto';
import { SocialLoginService } from './socialLogin.service';
import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
  Res,
  ValidationPipe,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('소셜 로그인')
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
  userValidation(@Headers('authorization') accessTokenBearer: string) {
    return this.socialLoginService.userValidation(accessTokenBearer);
  }

  @Post('completion')
  firstLogin(
    @Headers('authorization') accessTokenBearer: string,
    @Body(ValidationPipe) completeFistLoginDTO: CompleteFirstLoginDTO,
  ) {
    console.log(accessTokenBearer);
    return this.socialLoginService.completeFirstLogin(
      accessTokenBearer,
      completeFistLoginDTO,
    );
  }

  @Get('refresh')
  refreshAccessToken(
    @Headers('authorization') accessTokenBearer: string,
    @Headers('refreshToken') refreshTokenBearer: string,
  ) {
    return this.socialLoginService.refreshAccessToken(
      accessTokenBearer,
      refreshTokenBearer,
    );
  }

  @Get('duplicateCheck/nickname/:nickname')
  duplicationCheckByNickname(@Param('nickname') nickname: string) {
    return this.socialLoginService.duplicationCheckByNickname(nickname);
  }

  @Get('me')
  getUserInfoWithAccessToken(
    @Headers('authorization') accessTokenBearer: string,
  ) {
    console.log('me acc', accessTokenBearer);
    return this.socialLoginService.getUserInfoWithAccessToken(
      accessTokenBearer,
    );
  }
}
