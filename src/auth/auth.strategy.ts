import { AuthService } from './auth.service';
import { Users } from '../socialLogin/entity/users.entity';
import { InjectRepository } from '@nestjs/typeorm';
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
import { Repository } from 'typeorm';

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
    if (!accessTokenBearer) {
      throw new HttpException(
        '로그인이 필요한 기능입니다.',
        HttpStatus.FORBIDDEN, // 403 ERROR
      );
    } else if (!refreshTokenBearer) {
      const jwtDecrypt = this.authService.jwtVerification(
        accessTokenBearer.split(' ')[1],
      );
      if (jwtDecrypt.message) {
        switch (jwtDecrypt.message) {
          case 'jwt expired':
            throw new HttpException(
              'Access Token Expired',
              HttpStatus.UNAUTHORIZED,
            );
            break;
          case 'jwt malformed':
            throw new HttpException(
              'Access Token Maliciously Modified',
              HttpStatus.FORBIDDEN,
            );
            break;
        }
      }
      const userId = jwtDecrypt.userId;
    }
  }
}
