import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';
// import { Connection, Repository } from 'typeorm';
import { Users } from './entity/users.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {} // @Inject('USER_REPOSITORY')
  // private userRepository: Repository<Users>,

  async getKakaoToken(code) {
    let accessToken: string;
    let refreshToken: string;
    try {
      const clientId = this.configService.get<string>('KAKAO_REST_API_KEY');
      const redirectURL = this.configService.get<string>('KAKAO_REDIRECT_URL');
      const grantType = 'authorization_code';
      const result = await axios({
        method: 'POST',
        url: `https://kauth.kakao.com/oauth/token?grant_type=${grantType}&client_id=${clientId}&redirect_uri=${redirectURL}&code=${code}`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
      });
      const data = result.data;
      accessToken = data.access_token;
      refreshToken = data.refresh_token;
      console.log(data);
      console.log(accessToken);
    } catch (err) {
      throw new HttpException(err, HttpStatus.UNAUTHORIZED);
    }

    return this.getUserInfoByToken(accessToken, refreshToken, 'kakao');
  }

  async getGoogleToken(code: string): Promise<any> {
    console.log(code);
    console.log(typeof code);
    let accessToken: string;
    let refreshToken: string;
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientPassword = this.configService.get<string>(
      'GOOGLE_CLIENT_PASSWORD',
    );
    const redirectURL = this.configService.get<string>('GOOGLE_REDIRECT_URL');
    console.log('여기는 도착!');

    const URL = `https://oauth2.googleapis.com/token?code=${code}&client_id=${clientId}&client_secret=${clientPassword}&redirect_uri=${redirectURL}&grant_type=authorization_code`;
    try {
      console.log(URL);
      console.log(clientId);
      console.log(clientPassword);

      const result = await axios({
        method: 'POST',
        url: URL,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      const data = result.data;
      accessToken = data.access_token;
      refreshToken = data.refresh_token;
    } catch (err) {
      console.log(err);
      throw new HttpException(
        `error: ${err.response.data.error}, errorDescription: ${err.response.data.error_description}`,
        HttpStatus.UNAUTHORIZED,
      );
    }

    return this.getUserInfoByToken(accessToken, refreshToken, 'google');
  }

  async getGithubToken(code: string) {
    const clientId = this.configService.get<string>('GITHUB_CLIENT_ID');
    const clientPassword = this.configService.get<string>(
      'GITHUB_CLIENT_PASSWORD',
    );

    const URL = `https://github.com/login/oauth/access_token?client_id=${clientId}&client_secret=${clientPassword}&code=${code}`;
    let data = {
      client_id: clientId,
      client_secret: clientPassword,
      code,
    };
    try {
      const result = await axios({
        method: 'POST',
        url: URL,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          Accept: 'application/json',
        },
      });

      data = result.data;
      console.log(data);
      return result.data;
    } catch (err) {
      console.error(err);
      throw new HttpException(err, HttpStatus.UNAUTHORIZED);
      return;
    }
  }

  async getUserInfoByToken(
    accessToken: string,
    refreshToken: string,
    site: string,
  ) {
    if (site === 'kakao') {
      const userInfo = await axios({
        method: 'GET',
        url: `https://kapi.kakao.com/v1/user/access_token_info`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const id = userInfo.data.id;
      // 여기서 DB에 접근해서 해당 유저가 존재하는 지 알아본다.
      const existUser = true;
      // await this.userRepository.findOne({
      //   where: {
      //     loginType: 1,
      //     loginToken: id.toString(),
      //   },
      // });
      if (existUser) {
        return this.existUserLogin(accessToken, refreshToken, 1, id);
      } else {
        return this.novelUserLogin(accessToken, refreshToken, 1, id);
      }
    }

    if (site === 'google') {
      const userInfo = await axios({
        method: 'POST',
        url: `https://www.googleapis.com/oauth2/v2/userinfo/?access_token="${accessToken}"`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const id = userInfo.data.id;
      const existUser = true;
      // await this.userRepository.findOne({
      //   where: {
      //     loginType: 2,
      //     loginToken: id.toString(),
      //   },
      // });
      if (existUser) {
        return this.existUserLogin(accessToken, refreshToken, 2, id);
      } else {
        return this.novelUserLogin(accessToken, refreshToken, 2, id);
      }
    }
  }

  async getNovelAccessToken(refreshToken: string) {
    const secret = this.configService.get<string>('MY_SECRET_KEY');
    // const { userId } = jwt.verify(refreshToken, secret).userId;

    return 'new access token';
  }

  existUserLogin(accessToken, refreshToken, loginType, id) {
    console.log('existUser');
    console.log(accessToken, refreshToken, loginType, id);
  }

  novelUserLogin(accessToken, refreshToken, loginType, id) {
    console.log('novelUser');
    console.log(accessToken, refreshToken, loginType, id);
  }
}
