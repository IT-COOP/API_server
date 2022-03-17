import { MY_SECRET_KEY, ACCESS_TOKEN_DURATION } from './jwt/jwt.secret';
import { AuthService } from './auth.service';
import { Users } from './../socialLogin/entity/Users';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class StrictGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { req, accessTokenBearer, refreshTokenBearer } =
      this.authService.getTokensFromContext(context);
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
      if (refreshTokenBearer) {
        req.user = {
          userInfo: existUser,
          authorization: `Bearer ${novelAccessToken}`,
        };
      } else {
        req.user = {
          userInfo: existUser,
        };
      }
      return true;
    } else if (!existUser.nickname) {
      throw new HttpException('There Is No Such User', HttpStatus.FORBIDDEN);
    }
  }
}

@Injectable()
export class LooseGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { req, accessTokenBearer, refreshTokenBearer } =
      this.authService.getTokensFromContext(context);

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
      req.user = {
        userInfo: existUser,
        authorization: `Bearer ${novelAccessToken}`,
      };
      return true;
    } else {
      return true;
    }
  }
}
