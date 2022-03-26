import { loginError } from './../common/error';
import { InputJwtError } from './../socialLogin/enum/enums';
import { JwtVerifyType } from './type/auth.type';
import { Users } from './../socialLogin/entity/Users';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Injectable, ExecutionContext } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
  ) {}
  MY_SECRET_KEY = this.configService.get<string>('MY_SECRET_KEY');
  ACCESS_TOKEN_DURATION = this.configService.get<string>(
    'ACCESS_TOKEN_DURATION',
  );
  REFRESH_TOKEN_DURATION = this.configService.get<string>(
    'REFRESH_TOKEN_DURATION',
  );

  findUserByUserId(userId: string): Promise<Users | undefined> {
    return this.userRepository.findOne({ where: { userId } });
  }

  jwtVerification(token: string): JwtVerifyType {
    const ret: JwtVerifyType = {
      message: null,
      userId: null,
    };
    jwt.verify(token, this.MY_SECRET_KEY, (err, decoded: jwt.JwtPayload) => {
      if (err) {
        ret.message = err.message;
        /**
         * 'jwt expired'
         * 'jwt malformed'
         */
      } else {
        ret.userId = decoded.sub as string;
      }
    });
    return ret;
  }

  createAccessTokenWithUserId(userId: string): string {
    const accessToken = jwt.sign({ sub: userId }, this.MY_SECRET_KEY, {
      expiresIn: this.ACCESS_TOKEN_DURATION,
    });
    return accessToken;
  }

  createRefreshTokenWithUserId(userId: string): string {
    const refreshToken = jwt.sign({ sub: userId }, this.MY_SECRET_KEY, {
      expiresIn: this.REFRESH_TOKEN_DURATION,
    });
    return refreshToken;
  }

  getUserIdFromDecryptedAccessToken(decrypted: JwtVerifyType) {
    switch (decrypted.message) {
      case InputJwtError.tokenExpired:
        throw loginError.AccessTokenExpiredError;
      case InputJwtError.tokenMalformed:
        throw loginError.AccessTokenModifiedError;
      case InputJwtError.noJWT:
        throw loginError.AccessTokenRequiredError;
      default:
        return decrypted.userId;
    }
  }

  getUserIdFromDecryptedRefreshToken(decrypted: JwtVerifyType) {
    switch (decrypted.message) {
      case InputJwtError.tokenExpired:
        throw loginError.RefreshTokenExpiredError;
      case InputJwtError.tokenMalformed:
        throw loginError.RefreshTokenModifiedError;
      case InputJwtError.noJWT:
        throw loginError.RefreshTokenRequiredError;
      default:
        return decrypted.userId;
    }
  }

  getTokensFromContext(context: ExecutionContext): {
    res: Response;
    accessTokenBearer: string;
  } {
    const [req, res] = context.getArgs();
    const headers: string[] = req.rawHeaders;
    const indexOfAccessTokenBearer = headers.indexOf('authorization');
    const accessTokenBearer =
      indexOfAccessTokenBearer !== -1
        ? headers[indexOfAccessTokenBearer + 1]
        : '';
    return {
      res,
      accessTokenBearer,
    };
  }
}
