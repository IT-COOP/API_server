import { CompleteFirstLoginDTO } from './dto/completeFirstLogin.dto';
import { payload } from './type/jwt.type';
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
export class AuthService {
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

      console.log('github Token:', result.data);
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
    let id: string;
    try {
      if (site === LoginType['kakao']) {
        const userInfo = await axios({
          method: 'GET',
          url: `https://kapi.kakao.com/v1/user/access_token_info`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        id = userInfo.data.id.toString();
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
        id = userInfo.data.sub; // << 유저의 고유값
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
        id = userInfo.data.id.toString();

        const redirectToFront = this.configService.get<string>('FRONT_SERVER');
        res.redirect(`${redirectToFront}${accessToken}`);
      } else {
        throw new HttpException(
          'error: Bad Request, errorDescription: wrong ',
          HttpStatus.BAD_REQUEST,
        );
      }

      const existUser = await this.userRepository.findOne({
        where: {
          loginType: site,
          indigenousKey: id,
        },
      });
      const redirectToFront = this.configService.get<string>('FRONT_SERVER');
      res.redirect(`${redirectToFront}${accessToken}`);

      return this.internalTokenCreation(existUser, id, site, res);
    } catch (err) {
      throw new HttpException(
        `error: ${err.response.data.error}, errorDescription: ${err.response.data.error_description}`,
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
  async internalTokenCreation(
    existUser: Users | undefined,
    id: string,
    site: number,
    res: Response,
  ) {
    const SECRET_KEY = this.configService.get<string>('MY_SECRET_KEY');
    const redirectToFront = this.configService.get<string>('FRONT_SERVER');
    let accessToken: string;
    let payload: payload;
    if (existUser && existUser.nickname) {
      // 다회차 고인물
      payload = { userId: existUser.userId };
      const accessToken = jwt.sign(payload, SECRET_KEY, {
        expiresIn: '1h',
      });
      const refreshToken = jwt.sign({}, SECRET_KEY, {
        expiresIn: '24h',
      });
      existUser.refreshToken = refreshToken;
      await this.userRepository.save(existUser);
      console.log(payload);
      return res.redirect(
        `${redirectToFront}accessToken=${accessToken}&refreshToken=${refreshToken}&isFirst=`,
      );
    } else if (existUser) {
      payload = { userId: existUser.userId };
      accessToken = jwt.sign(payload, SECRET_KEY, {
        expiresIn: '10m',
      });
    } else {
      const userId = v1();
      const newUser = this.userRepository.create();
      newUser.userId = userId;
      newUser.loginType = site;
      newUser.indigenousKey = id;
      await this.userRepository.save(newUser);
      payload = { userId };
      accessToken = jwt.sign(payload, SECRET_KEY, {
        expiresIn: '10m',
      });
    }
    console.log(payload);
    return res.redirect(
      `${redirectToFront}accessToken=${accessToken}&isFirst=1`,
    );
  }

  async completeFirstLogin(id, body: CompleteFirstLoginDTO) {
    const SECRET_KEY = this.configService.get<string>('MY_SECRET_KEY');
    const intermediateUser = await this.userRepository.findOne({
      where: {
        userId: id,
      },
    });

    const payload: payload = { userId: body.userId };
    const accessToken = jwt.sign(payload, SECRET_KEY, {
      expiresIn: '10m',
    });
    const refreshToken = jwt.sign({}, SECRET_KEY, { expiresIn: '24h' });
    for (const element in body) {
      intermediateUser[element] = body[element];
    }
    intermediateUser.refreshToken = refreshToken;
    await this.userRepository.save(intermediateUser);

    return {
      authorization: `Bearer ${accessToken}`,
      refreshToken: `Bearer ${refreshToken}`,
    };
  }
}
