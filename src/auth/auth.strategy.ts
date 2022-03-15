import { ACCESS_TOKEN_DURATION, MY_SECRET_KEY } from './jwt/jwt.secret';
import { AuthService } from './auth.service';
import { Users } from '../socialLogin/entity/Users';
import { Headers, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class StrictStrategy extends PassportStrategy(Strategy, 'strict') {
  constructor(private readonly authService: AuthService) {
    super();
  }

  // return한 값은 req.user에 들어간다 - passport

  async validation(
    @Headers('authorization') accessTokenBearer: string | undefined,
    @Headers('refreshToken') refreshTokenBearer: string | undefined,
  ): Promise<any> {
    let userId: string;
    let existUser: Users | undefined;
    if (!accessTokenBearer && !refreshTokenBearer) {
      throw new HttpException(
        '로그인이 필요한 기능입니다.',
        HttpStatus.FORBIDDEN, // 403 ERROR
      );
    }
    if (accessTokenBearer) {
      const decrypted = this.authService.jwtVerification(
        accessTokenBearer.split(' ')[1],
      );
      userId = this.authService.getUserIdFromDecryptedAccessToken(decrypted);
      existUser = await this.authService.findUserByUserId(userId);
    } else if (refreshTokenBearer) {
      const decrypted = this.authService.jwtVerification(
        accessTokenBearer.split(' ')[1],
      );
      userId = this.authService.getUserIdFromDecryptedRefreshToken(decrypted);
      existUser = await this.authService.findUserByUserIdAndRefreshToken(
        userId,
        refreshTokenBearer.split(' ')[1],
      );
    }
    if (existUser && existUser.nickname) {
      const novelAccessToken = jwt.sign({ sub: userId }, MY_SECRET_KEY, {
        expiresIn: ACCESS_TOKEN_DURATION,
      });
      return {
        userInfo: existUser,
        authorization: `Bearer ${novelAccessToken}`,
      };
    } else if (!existUser.nickname) {
      throw new HttpException('There Is No Such User', HttpStatus.FORBIDDEN);
    }
  }
}

@Injectable()
export class LooseStrategy extends PassportStrategy(Strategy, 'loose') {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async validation(
    @Headers('authorization') accessTokenBearer: string | undefined,
    @Headers('refreshToken') refreshTokenBearer: string | undefined,
  ): Promise<any> {
    let userId: string;
    let existUser: Users | undefined;
    if (accessTokenBearer) {
      const decrypted = this.authService.jwtVerification(
        accessTokenBearer.split(' ')[1],
      );
      userId = this.authService.getUserIdFromDecryptedAccessToken(decrypted);
      existUser = await this.authService.findUserByUserId(userId);
    } else if (refreshTokenBearer) {
      const decrypted = this.authService.jwtVerification(
        accessTokenBearer.split(' ')[1],
      );
      userId = this.authService.getUserIdFromDecryptedRefreshToken(decrypted);
      existUser = await this.authService.findUserByUserIdAndRefreshToken(
        userId,
        refreshTokenBearer.split(' ')[1],
      );
    }
    if (existUser && existUser.nickname) {
      const novelAccessToken = jwt.sign({ sub: userId }, MY_SECRET_KEY, {
        expiresIn: ACCESS_TOKEN_DURATION,
      });
      return {
        userInfo: existUser,
        authorization: `Bearer ${novelAccessToken}`,
      };
    } else if (!existUser.nickname) {
      return;
    }
  }
}
