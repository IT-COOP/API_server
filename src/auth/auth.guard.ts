import { loginError } from './../common/error';
import { AuthService } from './auth.service';
import { Users } from './../socialLogin/entity/Users';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class StrictGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { res, accessTokenBearer } =
      this.authService.getTokensFromContext(context);
    let userId: string;
    let existUser: Users | undefined;
    if (!accessTokenBearer) {
      throw loginError.LoginRequiredError;
    }
    if (accessTokenBearer) {
      const decrypted = this.authService.jwtVerification(
        accessTokenBearer.split(' ')[1],
      );
      userId = this.authService.getUserIdFromDecryptedAccessToken(decrypted);
      existUser = await this.authService.findUserByUserId(userId);
    }
    if (existUser && existUser.nickname) {
      res.locals.user = existUser;
      return true;
    } else if (existUser) {
      throw loginError.TutorialRequiredError;
    } else {
      throw loginError.MissingUserError;
    }
  }
}

@Injectable()
export class LooseGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { res, accessTokenBearer } =
      this.authService.getTokensFromContext(context);
    let userId: string | null;
    let existUser: Users | undefined;
    if (accessTokenBearer) {
      const decrypted = this.authService.jwtVerification(
        accessTokenBearer.split(' ')[1],
      );
      userId = decrypted.userId || null;
      if (userId) {
        existUser = await this.authService.findUserByUserId(userId);
      }
    }
    if (existUser && existUser.nickname) {
      res.locals.user = existUser;
      return true;
    } else {
      res.locals.user = { userId: null };
      return true;
    }
  }
}
