import {
  InputJwtError,
  RefreshTokenErrorMessage,
  AccessTokenErrorMessage,
} from './../socialLogin/enum/enums';
import { CheckUserIdInterface, JwtVerifyInterFace } from './type/auth.type';
import { Users } from './../socialLogin/entity/Users';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import {
  Injectable,
  HttpStatus,
  HttpException,
  ExecutionContext,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { requiredColumns } from './jwt/jwt.secret';
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

  async findUserByUserId(userId: string): Promise<Users | undefined> {
    return await this.userRepository.findOne({ where: { userId } });
  }

  async findUserByUserIdAndRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<Users | undefined> {
    return await this.userRepository
      .createQueryBuilder()
      .select(requiredColumns)
      .where('userId = :userId', { userId })
      .andWhere('refreshToken = :refreshToken', { refreshToken })
      .getOne();
  }

  jwtVerification(token: string): JwtVerifyInterFace {
    const ret: JwtVerifyInterFace = {
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

  async checkUserStatusByUserId(userId: string): Promise<CheckUserIdInterface> {
    const targetUser = await this.userRepository.findOne({
      where: userId,
    });
    const validation = {
      isValid: true,
      isProfileSet: true,
    };
    if (!targetUser) {
      validation.isValid = false;
      validation.isProfileSet = false;
    } else if (targetUser.nickname === '') {
      validation.isProfileSet = true;
    }
    return validation;
  }

  getUserIdFromDecryptedAccessToken(decrypted: JwtVerifyInterFace) {
    switch (decrypted.message) {
      case InputJwtError.tokenExpired:
        throw new HttpException(
          AccessTokenErrorMessage.tokenExpired,
          HttpStatus.UNAUTHORIZED,
        );
      case InputJwtError.tokenMalformed:
        throw new HttpException(
          AccessTokenErrorMessage.tokenMalformed,
          HttpStatus.FORBIDDEN,
        );
      default:
        return decrypted.userId;
    }
  }

  getUserIdFromDecryptedRefreshToken(decrypted: JwtVerifyInterFace) {
    switch (decrypted.message) {
      case InputJwtError.tokenExpired:
        throw new HttpException(
          RefreshTokenErrorMessage.tokenExpired,
          HttpStatus.UNAUTHORIZED,
        );
      case InputJwtError.tokenMalformed:
        throw new HttpException(
          RefreshTokenErrorMessage.tokenMalformed,
          HttpStatus.FORBIDDEN,
        );
      default:
        return decrypted.userId;
    }
  }

  getTokensFromContext(context: ExecutionContext): {
    res: Response;
    accessTokenBearer: string;
    refreshTokenBearer: string;
  } {
    const [req, res] = context.getArgs();
    const headers: string[] = req.rawHeaders;
    const indexOfAccessTokenBearer = headers.indexOf('authorize');
    const indexOfRefreshTokenBearer = headers.indexOf('refreshToken');
    const accessTokenBearer =
      indexOfAccessTokenBearer !== -1
        ? headers[indexOfAccessTokenBearer + 1]
        : '';

    const refreshTokenBearer =
      indexOfRefreshTokenBearer !== -1
        ? headers[indexOfRefreshTokenBearer + 1]
        : '';
    return {
      res,
      accessTokenBearer,
      refreshTokenBearer,
    };
  }
}
