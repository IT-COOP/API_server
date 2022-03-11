import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { map, Observable } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}
  kakaoLoginGetToken(code: string): Observable<AxiosResponse> {
    const clientId = this.configService.get<string>('KAKAO_REST_API_KEY');
    const redirectURL = this.configService.get<string>('KAKAO_REDIRECT_URL');
    const grantType = 'authorization_code';
    const URL = `https://kauth.kakao.com/oauth/token?grant_type=${grantType}&client_id=${clientId}&redirect_uri=${redirectURL}&code=${code}`;
    const response = this.httpService.post(URL, {
      headers: {
        'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
    });

    response.subscribe((value) => {
      console.log(value.data);
    });

    response.subscribe((val) => console.log(val.data));
    return response;
  }

  // googleLogin(code: string): Observable<AxiosResponse> {
  //   const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
  //   const clientPassword = this.configService.get<string>(
  //     'GOOGLE_CLIENT_PASSWORD',
  //   );
  //   const redirectURL = this.configService.get<string>('GOOGLE_REDIRECT_URL');
  //   const URL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectURL}&response_type=code&scope=https://www.googleapis.com/auth/userinfo.email`;

  //   return this.httpService.post(URL);
  // }

  // githubLogin(code: string): Observable<AxiosResponse> {
  //   const clientId = this.configService.get<string>('GITHUB_CLIENT_ID');
  //   const clientPassword = this.configService.get<string>(
  //     'GITHUB_CLIENT_PASSWORD',
  //   );
  //   const URL = this.configService.get<string>('GITHUB_REQUEST_URL');
  //   const data = {
  //     client_id: clientId,
  //     client_secret: clientPassword,
  //     code,
  //   };

  //   const response = this.httpService.post(URL, data, {
  //     headers: {
  //       accept: 'application/json',
  //     },
  //   });

  //   return response.pipe(map((response) => response.data));
  // }

  getTokenFromUrl(
    url: string,
    option: AxiosResponse,
  ): Observable<AxiosResponse> {
    return this.httpService.post(url, option);
  }
}
