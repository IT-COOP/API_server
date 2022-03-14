import { AuthService } from './../auth/auth.service';
import {
  ACCESS_TOKEN_DURATION,
  MY_SECRET_KEY,
  REFRESH_TOKEN_DURATION,
} from '../auth/jwt/jwt.secret';
import { CompleteFirstLoginDTO } from './dto/completeFirstLogin.dto';
import { Users } from './entity/users.entity';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import * as jwt from 'jsonwebtoken';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  LoginType,
  InputJwtError,
  AccessTokenErrorMessage,
  RefreshTokenErrorMessage,
} from './enum/enums';
import { v1 } from 'uuid';

@Injectable()
export class SocialLoginService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
  ) {}

  async getKakaoToken(code: string, res: Response) {
    const clientId = this.configService.get<string>('KAKAO_REST_API_KEY');
    const redirectURL = this.configService.get<string>('KAKAO_REDIRECT_URL');
    const grantType = 'authorization_code';
    const URL = `https://kauth.kakao.com/oauth/token`;
    let accessToken: string;

    try {
      const result = await axios({
        method: 'POST',
        url: URL,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
        params: {
          code,
          grant_type: grantType,
          client_id: clientId,
          redirect_uri: redirectURL,
        },
      });
      accessToken = result.data.access_token;
    } catch (err) {
      throw new HttpException(
        `error: ${err.response.data.error}, errorDescription: ${err.response.data.error_description}`,
        HttpStatus.UNAUTHORIZED,
      );
    }
    return this.getUserInfoByToken(accessToken, LoginType.kakao, res);
  }

  async getGoogleToken(code: string, res: Response): Promise<any> {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientPassword = this.configService.get<string>(
      'GOOGLE_CLIENT_PASSWORD',
    );
    const redirectURL = this.configService.get<string>('GOOGLE_REDIRECT_URL');
    const URL = 'https://oauth2.googleapis.com/token';
    let accessToken: string;
    let idToken: string;

    try {
      const result = await axios({
        method: 'POST',
        url: URL,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
        params: {
          code,
          grant_type: 'authorization_code',
          client_id: clientId,
          client_secret: clientPassword,
          redirect_uri: redirectURL,
        },
      });
      accessToken = result.data.access_token;
      idToken = result.data.id_token;
    } catch (err) {
      throw new HttpException(
        `error: ${err.response.data.error}, errorDescription: ${err.response.data.error_description}`,
        HttpStatus.UNAUTHORIZED,
      );
    }
    return this.getUserInfoByToken(accessToken, LoginType.google, res, idToken);
  }

  async getGithubToken(code: string, res: Response) {
    const clientId = this.configService.get<string>('GITHUB_CLIENT_ID');
    const clientPassword = this.configService.get<string>(
      'GITHUB_CLIENT_PASSWORD',
    );
    const URL = `https://github.com/login/oauth/access_token`;
    let accessToken: string;

    try {
      const result = await axios({
        method: 'POST',
        url: URL,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          Accept: 'application/json',
        },
        params: {
          code,
          grant_type: 'authorization_code',
          client_id: clientId,
          client_secret: clientPassword,
        },
      });
      accessToken = result.data.access_token;
    } catch (err) {
      throw new HttpException(
        `error: ${err.response.data.error}, errorDescription: ${err.response.data.error_description}`,
        HttpStatus.UNAUTHORIZED,
      );
    }
    return this.getUserInfoByToken(accessToken, LoginType.github, res);
  }

  async getUserInfoByToken(
    accessToken: string,
    loginType: number,
    res: Response,
    idToken?: string,
  ) {
    let indigenousKey: string;
    let userInfo: AxiosResponse<any, any>;

    try {
      switch (loginType) {
        case LoginType.kakao:
          userInfo = await axios({
            method: 'GET',
            url: `https://kapi.kakao.com/v1/user/access_token_info`,
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          indigenousKey = String(userInfo.data.id);

          break;
        case LoginType.google:
          userInfo = await axios({
            method: 'GET',
            url: `https://oauth2.googleapis.com/tokeninfo`,
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
            },
            params: {
              id_token: `${idToken}`,
            },
          });
          indigenousKey = String(userInfo.data.sub);
          break;
        case LoginType.github:
          userInfo = await axios({
            method: 'GET',
            url: 'https://api.github.com/user',
            headers: {
              Authorization: `token ${accessToken}`,
              'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
              Accept: 'application/json',
            },
          });
          indigenousKey = String(userInfo.data.id);
          break;
        default:
          throw new HttpException(
            'error: Bad Request, errorDescription: Requested Social Login site Not Yet Ready.',
            HttpStatus.BAD_REQUEST,
          );
      }
    } catch (err) {
      throw new HttpException(
        `소셜 로그인 요청 에러, error: ${err}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return this.internalTokenCreation(indigenousKey, loginType, res);
  }

  async internalTokenCreation(
    indigenousKey: string,
    loginType: number,
    res: Response,
  ) {
    const redirectToFront = this.configService.get<string>('FRONT_SERVER');
    const existUser = await this.userRepository
      .createQueryBuilder()
      .where('indigenousKey = :indigenousKey', { indigenousKey })
      .getOne();
    let payload: jwt.JwtPayload;
    let isProfileSet = 'isProfileSet=false';
    if (existUser) {
      payload = { sub: existUser.userId };
    } else {
      const userId = v1();
      const newUser = new Users();
      newUser.userId = userId;
      newUser.loginType = loginType;
      newUser.indigenousKey = indigenousKey;
      await this.userRepository
        .createQueryBuilder()
        .insert()
        .into(Users)
        .values(newUser)
        .execute();
      payload = { sub: userId };
    }
    const accessToken = jwt.sign(payload, MY_SECRET_KEY, {
      expiresIn: ACCESS_TOKEN_DURATION,
    });
    if (existUser && existUser.nickname) {
      isProfileSet = 'isProfileSet=true';
    }
    return res.redirect(
      `${redirectToFront}accessToken=${accessToken}&${isProfileSet}`,
    );
  }

  async userValidation(accessTokenBearer: string, refreshTokenBearer: string) {
    // access Token 혹은 refresh Token이 넘어온다.
    let payload: jwt.JwtPayload;

    // case 1. accessToken이 넘어왔다.
    if (accessTokenBearer) {
      const accessToken = accessTokenBearer.split(' ')[1];
      const decrypted = this.authService.jwtVerification(accessToken);
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
          payload = { sub: decrypted.userId };
      }
    } else if (refreshTokenBearer) {
      const refreshToken = refreshTokenBearer.split(' ')[1];
      const decrypted = this.authService.jwtVerification(refreshToken);
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
          payload = { sub: decrypted.userId };
      }
    }
    // payload는 만들었어
    // 그럼 이제는 이 토큰에서 받은 userId를 토대로 user를 찾고, 정보가 있으면 함께 내려주면 된다.
    const targetUser = await this.userRepository
      .createQueryBuilder('users')
      .where('userId = :userId', { userId: payload.sub })
      .select(['users.userId', 'users.nickname', 'users.profileImgUrl'])
      .getOne();

    const accessToken = this.authService.createAccessTokenWithUserId(
      payload.sub,
    );
    if (targetUser.nickname) {
      // 닉네임 이미 채움
      const refreshToken = this.authService.createRefreshTokenWithUserId(
        payload.sub,
      );
      return {
        success: true,
        data: {
          userInfo: targetUser,
          authorization: `Bearer ${accessToken}`,
          refreshToken: `Bearer ${refreshToken}`,
        },
      };
    }
    // 아예 처음 오는 사람은 멀쩡한 엑세스 토큰이 있을 수가 없음!
    // 닉네임 안 채움
    return {
      success: true,
      data: {
        userInfo: targetUser,
        authorization: `Bearer ${accessToken}`,
      },
    };
  }

  async completeFirstLogin(
    accessTokenBearer: string,
    body: CompleteFirstLoginDTO,
  ) {
    if (typeof accessTokenBearer !== 'string') {
      throw new HttpException('Access Token Required', HttpStatus.FORBIDDEN);
    }
    let userId: string;
    try {
      const verified = jwt.verify(
        accessTokenBearer.split(' ')[1],
        MY_SECRET_KEY,
      );
      if (typeof verified === 'string') {
        // 타입스크립트가 지랄해서 넣음
        throw new HttpException(
          'Unprocessable Entity',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      const payload: jwt.JwtPayload = verified;
      userId = payload.sub;
    } catch (err) {
      throw new HttpException(`${err}`, HttpStatus.BAD_REQUEST);
    }

    const payload: jwt.JwtPayload = { sub: body.userId };
    const accessToken = jwt.sign(payload, MY_SECRET_KEY, {
      expiresIn: ACCESS_TOKEN_DURATION,
    });
    const refreshToken = jwt.sign({ sub: body.userId }, MY_SECRET_KEY, {
      expiresIn: REFRESH_TOKEN_DURATION,
    });
    const mySet: any = {};
    for (const each in body) {
      mySet[each] = body[each];
    }
    mySet.refreshToken = refreshToken;
    await this.userRepository
      .createQueryBuilder('users')
      .update(Users)
      .set(mySet)
      .where('userId = :userId', { userId })
      .execute();

    const userInfo = await this.userRepository.findOne({
      where: {
        userId: mySet.userId,
      },
      select: ['nickname', 'profileImgUrl'],
    });

    return {
      userInfo: userInfo,
      authorization: `Bearer ${accessToken}`,
      refreshToken: `Bearer ${refreshToken}`,
    };
  }
}
