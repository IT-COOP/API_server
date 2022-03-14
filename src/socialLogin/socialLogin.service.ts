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
import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginType } from './enum/enums';
import { v1 } from 'uuid';

@Injectable()
export class SocialLoginService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
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

    return this.getUserInfoByToken(accessToken, LoginType['kakao'], res);
  }

  async getGoogleToken(code: string, res: Response): Promise<any> {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientPassword = this.configService.get<string>(
      'GOOGLE_CLIENT_PASSWORD',
    );
    const redirectURL = this.configService.get<string>('GOOGLE_REDIRECT_URL');
    const URL = 'https://oauth2.googleapis.com/token';
    let accessToken = '';
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

    return this.getUserInfoByToken(
      accessToken,
      LoginType['google'],
      res,
      idToken,
    );
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
      return;
    }

    return this.getUserInfoByToken(accessToken, LoginType['github'], res);
  }

  async getUserInfoByToken(
    accessToken: string,
    site: number,
    res: Response,
    idToken?: string,
  ) {
    console.log('정보 내놔!');
    let id: number;
    let existUser: Users | undefined;
    try {
      if (site === LoginType['kakao']) {
        const userInfo = await axios({
          method: 'GET',
          url: `https://kapi.kakao.com/v1/user/access_token_info`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        console.log('kakao', typeof userInfo.data.id, userInfo.data.id);
        id = userInfo.data.id;
        console.log('정보 받아썽 카카오');
        //
        //
      } else if (site === LoginType['google']) {
        const userInfo = await axios({
          method: 'GET',
          url: `https://oauth2.googleapis.com/tokeninfo`,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          },
          params: {
            id_token: `${idToken}`,
          },
        });
        console.log('google', typeof userInfo.data.sub, userInfo.data.sub);
        id = Number(userInfo.data.sub); // << 유저의 고유값
        console.log('정보 받아썽 구글');
        //
        //
      } else if (site === LoginType['github']) {
        const userInfo = await axios({
          method: 'GET',
          url: 'https://api.github.com/user',
          headers: {
            Authorization: `token ${accessToken}`,
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
            Accept: 'application/json',
          },
        });
        console.log('깃헙', typeof userInfo.data.id, userInfo.data.id);
        id = userInfo.data.id;
        console.log('정보 받아썽 깃헙');
      } else {
        console.log('너는 아니지?');
        throw new HttpException(
          'error: Bad Request, errorDescription: 잘못된 요청입니다.',
          HttpStatus.BAD_REQUEST,
        );
      }
      console.log('해싱에서 뻑이 가나?');
      console.log(typeof id);

      existUser = await this.userRepository.findOne({
        where: {
          loginType: site,
          indigenousKey: id,
        },
      });
    } catch (err) {
      console.log('너에게 닿기를');
      throw new HttpException(
        `소셜 로그인 요청 에러, error: ${err}`,
        HttpStatus.UNAUTHORIZED,
      );
      return;
    }
    return this.internalTokenCreation(existUser, id, site, res);
  }

  async internalTokenCreation(
    existUser: Users | undefined,
    id: number,
    site: number,
    res: Response,
  ) {
    console.log('토큰 맹글기');
    const redirectToFront = this.configService.get<string>('FRONT_SERVER');
    let accessToken: string;
    let payload: jwt.JwtPayload;
    if (existUser && existUser.nickname) {
      // 다회차 고인물
      payload = { sub: existUser.userId };
      const accessToken = jwt.sign(payload, MY_SECRET_KEY, {
        expiresIn: ACCESS_TOKEN_DURATION,
      });
      const refreshToken = jwt.sign({ sub: existUser.userId }, MY_SECRET_KEY, {
        expiresIn: REFRESH_TOKEN_DURATION,
      });
      existUser.refreshToken = refreshToken;
      await this.userRepository.save(existUser);
      return res.redirect(
        `${redirectToFront}accessToken=${accessToken}&refreshToken=${refreshToken}`,
      );
    } else if (existUser) {
      payload = { sub: existUser.userId };
      accessToken = jwt.sign(payload, MY_SECRET_KEY, {
        expiresIn: ACCESS_TOKEN_DURATION,
      });
    } else {
      const userId = v1();
      const newUser = this.userRepository.create();
      newUser.userId = userId;
      newUser.loginType = site;
      newUser.indigenousKey = id;
      await this.userRepository.save(newUser);
      payload = { sub: userId };
      accessToken = jwt.sign(payload, MY_SECRET_KEY, {
        expiresIn: ACCESS_TOKEN_DURATION,
      });
    }
    return res.redirect(`${redirectToFront}accessToken=${accessToken}`);
  }

  async userValidation(accessToken: string, refreshToken: string) {
    let payload: jwt.JwtPayload;
    try {
      console.log(1);
      const verified = jwt.verify(accessToken, MY_SECRET_KEY);
      if (typeof verified === 'string') {
        console.log(2, verified);
        throw new Error();
        return;
      }
      console.log(3);
      payload = verified;
    } catch {
      // accessToken은 죽었고, refreshToken도 있다.
      console.log(4);
      if (refreshToken) {
        console.log(5, refreshToken);
        try {
          console.log(6);
          // refresh 토큰을 기반으로 DB에서 찾고, accessToken을 새로 발급해줌.
          const userId = jwt.decode(accessToken).sub;
          const existUser = await this.userRepository.findOne({
            select: ['nickname', 'profileImgUrl'],
            where: {
              userId,
              refreshToken,
            },
          });
          console.log(7, existUser);
          if (existUser) {
            const novelAccessToken = jwt.sign({ sub: userId }, MY_SECRET_KEY, {
              expiresIn: ACCESS_TOKEN_DURATION,
            });
            console.log(8, novelAccessToken);
            return {
              success: true,
              data: {
                userInfo: existUser,
                authorization: `Bearer ${novelAccessToken}`,
              },
            };
          }
        } catch (err) {}
      }
      console.log(9);
      // accessToken이 죽었고, refreshToken도 없다.
      throw new HttpException(`다시 로그인 해주세요`, HttpStatus.UNAUTHORIZED);
    }
    console.log(10);
    const userId = payload.sub;
    const existUser = await this.userRepository.findOne({
      where: {
        userId,
      },
      select: ['nickname', 'profileImgUrl'],
    });
    console.log(11, existUser);
    if (existUser && existUser.nickname) {
      const accessToken = jwt.sign({ sub: userId }, MY_SECRET_KEY, {
        expiresIn: ACCESS_TOKEN_DURATION,
      });
      console.log(12);
      return {
        success: true,
        data: {
          userInfo: existUser,
          authorization: `Bearer ${accessToken}`,
        },
      };
    } else if (existUser) {
      console.log(13);
      const accessToken = jwt.sign({ sub: userId }, MY_SECRET_KEY, {
        expiresIn: ACCESS_TOKEN_DURATION,
      });
      return {
        success: true,
        data: {
          userInfo: existUser,
          authorization: `Bearer ${accessToken}`,
        },
      };
    }
    console.log(14);
    throw new HttpException('잘못된 요청입니다.', HttpStatus.UNAUTHORIZED);
  }

  async completeFirstLogin(token, body: CompleteFirstLoginDTO) {
    let userId: string;
    try {
      const verified = jwt.verify(token, MY_SECRET_KEY);
      if (typeof verified === 'string') {
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
    const intermediateUser = await this.userRepository.findOne({
      where: {
        userId,
      },
    });

    const payload: jwt.JwtPayload = { sub: body.userId };
    const accessToken = jwt.sign(payload, MY_SECRET_KEY, {
      expiresIn: ACCESS_TOKEN_DURATION,
    });

    for (const element in body) {
      intermediateUser[element] = body[element];
    }
    const refreshToken = jwt.sign(
      { sub: intermediateUser.userId },
      MY_SECRET_KEY,
      {
        expiresIn: REFRESH_TOKEN_DURATION,
      },
    );
    intermediateUser.refreshToken = refreshToken;
    await this.userRepository.save(intermediateUser);

    return {
      authorization: `Bearer ${accessToken}`,
      refreshToken: `Bearer ${refreshToken}`,
    };
  }
}
