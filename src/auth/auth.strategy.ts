import { ACCESS_TOKEN_DURATION, MY_SECRET_KEY } from './jwt/jwt.secret';
import {
  InputJwtError,
  AccessTokenErrorMessage,
  RefreshTokenErrorMessage,
} from './../socialLogin/enum/enums';
import { AuthService } from './auth.service';
import { Users } from '../socialLogin/entity/users.entity';
import {
  Headers,
  Injectable,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'JwtGuard') {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async validation(
    @Headers('authorization') accessTokenBearer: string | undefined,
    @Headers('refreshToken') refreshTokenBearer: string | undefined,
    @Req() req,
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
      const jwtDecrypt = this.authService.jwtVerification(
        accessTokenBearer.split(' ')[1],
      );
      if (jwtDecrypt.message) {
        switch (jwtDecrypt.message) {
          case InputJwtError.tokenExpired:
            throw new HttpException(
              AccessTokenErrorMessage.tokenExpired,
              HttpStatus.UNAUTHORIZED,
            );
            break;
          case InputJwtError.tokenMalformed:
            throw new HttpException(
              AccessTokenErrorMessage.tokenMalformed,
              HttpStatus.FORBIDDEN,
            );
            break;
        }
      }
      userId = jwtDecrypt.userId;
      existUser = await this.authService.findUserByUserId(userId);
    } else if (refreshTokenBearer) {
      const jwtDecrypt = this.authService.jwtVerification(
        accessTokenBearer.split(' ')[1],
      );
      if (jwtDecrypt.message) {
        switch (jwtDecrypt.message) {
          case InputJwtError.tokenExpired:
            throw new HttpException(
              RefreshTokenErrorMessage.tokenExpired,
              HttpStatus.UNAUTHORIZED,
            );
            break;
          case InputJwtError.tokenMalformed:
            throw new HttpException(
              RefreshTokenErrorMessage.tokenMalformed,
              HttpStatus.FORBIDDEN,
            );
            break;
        }
      }
      existUser = await this.authService.findUserByUserIdAndRefreshToken(
        userId,
        refreshTokenBearer.split(' ')[1],
      );
      userId = jwtDecrypt.userId;
    }
    const novelAccessToken = jwt.sign({ sub: userId }, MY_SECRET_KEY, {
      expiresIn: ACCESS_TOKEN_DURATION,
    });
    req.userInfo = existUser;
    req.user = userId;
    return {
      authorization: `Bearer ${novelAccessToken}`,
    };
  }
}
