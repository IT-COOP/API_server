import { AuthService } from './auth.service';
import { Users } from './../socialLogin/entity/Users';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Injectable()
export class StrictGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { res, accessTokenBearer, refreshTokenBearer } =
      this.authService.getTokensFromContext(context);
    let userId: string;
    let existUser: Users | undefined;
    if (!accessTokenBearer && !refreshTokenBearer) {
      throw new HttpException(
        'You Need To Login First.',
        HttpStatus.FORBIDDEN, // 403 ERROR
      );
    }
    if (accessTokenBearer) {
      console.log('디크립트 합니까?');
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
      res.locals.user = existUser;
      console.log('strict Guard passed');
      return true;
    } else if (!existUser.nickname) {
      throw new HttpException('No User Matches JWT', HttpStatus.FORBIDDEN);
    }
  }
}

@Injectable()
export class LooseGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log(1);
    const { res, accessTokenBearer, refreshTokenBearer } =
      this.authService.getTokensFromContext(context);

    console.log('가드 시작');

    let userId: string;
    let existUser: Users | undefined;
    if (accessTokenBearer) {
      const decrypted = await this.authService.jwtVerification(
        accessTokenBearer.split(' ')[1],
      );
      console.log('가드 1');
      userId = this.authService.getUserIdFromDecryptedAccessToken(decrypted);
      existUser = await this.authService.findUserByUserId(userId);
    } else if (refreshTokenBearer) {
      const decrypted = this.authService.jwtVerification(
        accessTokenBearer.split(' ')[1],
      );
      console.log('가드 2');
      userId = this.authService.getUserIdFromDecryptedRefreshToken(decrypted);
      existUser = await this.authService.findUserByUserIdAndRefreshToken(
        userId,
        refreshTokenBearer.split(' ')[1],
      );
    }
    if (existUser && existUser.nickname) {
      res.locals.user = existUser;
      console.log('가드 마지막');
      return true;
    } else {
      res.locals.user = '';
      console.log(987987987);
      return true;
    }
  }
}
