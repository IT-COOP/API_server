import { CheckUserIdInterface, JwtVerifyInterFace } from './type/auth.type';
import { Users } from './../socialLogin/entity/users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { MY_SECRET_KEY, ACCESS_TOKEN_DURATION } from './jwt/jwt.secret';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
  ) {}

  jwtVerification(token): JwtVerifyInterFace {
    let ret: JwtVerifyInterFace;
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

  createJwtWithUserId(userId: string): string {
    const accessToken = jwt.sign({ sub: userId }, MY_SECRET_KEY, {
      expiresIn: ACCESS_TOKEN_DURATION,
    });
    return accessToken;
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

  async checkUserByUserIdAndRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<Users | undefined> {
    const targetUser = await this.userRepository.findOne({
      where: {
        userId,
        refreshToken,
      },
    });
    return targetUser;
  }
}
