import {
  InputJwtError,
  RefreshTokenErrorMessage,
  AccessTokenErrorMessage,
} from './../socialLogin/enum/enums';
import { CheckUserIdInterface, JwtVerifyInterFace } from './type/auth.type';
import { Users } from './../socialLogin/entity/Users';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { Repository } from 'typeorm';
import {
  MY_SECRET_KEY,
  ACCESS_TOKEN_DURATION,
  REFRESH_TOKEN_DURATION,
  requiredColumns,
} from './jwt/jwt.secret';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
  ) {}

  async findUserByUserId(userId: string): Promise<Users | undefined> {
    return await this.userRepository
      .createQueryBuilder()
      .select(requiredColumns)
      .where('userId = :userId', { userId })
      .getOne();
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
    jwt.verify(token, MY_SECRET_KEY, (err, decoded: jwt.JwtPayload) => {
      if (err) {
        ret.message = err.message;
        /**
         * 'jwt expired'
         *
         * 'jwt malformed'
         */
      } else {
        ret.userId = decoded.sub as string;
      }
    });
    return ret;
  }

  createAccessTokenWithUserId(userId: string): string {
    const accessToken = jwt.sign({ sub: userId }, MY_SECRET_KEY, {
      expiresIn: ACCESS_TOKEN_DURATION,
    });
    return accessToken;
  }

  createRefreshTokenWithUserId(userId: string): string {
    const refreshToken = jwt.sign({ sub: userId }, MY_SECRET_KEY, {
      expiresIn: REFRESH_TOKEN_DURATION,
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
}
