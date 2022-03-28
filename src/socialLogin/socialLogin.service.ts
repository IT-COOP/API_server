import { loginError } from './../common/error';
import { AuthService } from './../auth/auth.service';
import { CompleteFirstLoginDTO } from './dto/completeFirstLogin.dto';
import { Users } from './entity/Users';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import * as jwt from 'jsonwebtoken';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginType } from './enum/enums';
import { SHA3 } from 'sha3';
import { v1 as uuid } from 'uuid';

@Injectable()
export class SocialLoginService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
  ) {}

  hash = new SHA3(224);
  ACCESS_TOKEN_DURATION = this.configService.get<string>(
    'ACCESS_TOKEN_DURATION',
  );
  MY_SECRET_KEY = this.configService.get<string>('MY_SECRET_KEY');
  REFRESH_TOKEN_DURATION = this.configService.get<string>(
    'REFRESH_TOKEN_DURATION',
  );
  validNickname = /^[가-힣|a-z|A-Z|0-9|]+$/;

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
    const container = this.hash;
    let userInfo: AxiosResponse<any, any>;
    let key: string;

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
          key = String(userInfo.data.id);
          container.update(String(userInfo.data.id));

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
          key = String(userInfo.data.sub);
          container.update(String(userInfo.data.sub));
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
          key = String(userInfo.data.id);
          container.update(String(userInfo.data.id));
          break;
      }
    } catch (err) {
      throw new HttpException(
        `소셜 로그인 요청 에러, error: ${err}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    const indigenousKey = String(container.digest('hex'));
    console.log(indigenousKey, '해시한 것.');
    console.log(key, '해시 안한 것.');
    console.log(userInfo.data);
    return this.internalTokenCreation(key, loginType, res);
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
      .andWhere('loginType = :loginType', { loginType })
      .getOne();
    let payload: jwt.JwtPayload;
    if (existUser) {
      payload = { sub: existUser.userId };
    } else {
      const newUser = new Users();
      newUser.userId = uuid();
      newUser.loginType = loginType;
      newUser.indigenousKey = indigenousKey;
      await this.userRepository.insert(newUser);
      payload = { sub: newUser.userId };
    }
    const accessToken = jwt.sign(payload, this.MY_SECRET_KEY, {
      expiresIn: this.ACCESS_TOKEN_DURATION,
    });

    return res.redirect(`${redirectToFront}accessToken=${accessToken}`);
  }

  // 클라이언트와 시작
  async userValidation(accessTokenBearer: string) {
    // access Token이 넘어온다.
    if (!accessTokenBearer) {
      throw loginError.AccessTokenRequiredError;
    }
    const accessToken = accessTokenBearer.split(' ')[1];
    const decrypted = this.authService.jwtVerification(accessToken);
    const payload = {
      sub: this.authService.getUserIdFromDecryptedAccessToken(decrypted),
    };

    const targetUser = await this.userRepository.findOne({
      where: { userId: payload.sub },
      select: ['userId', 'profileImgUrl', 'activityPoint', 'nickname'],
    });
    const novelAccessToken = this.authService.createAccessTokenWithUserId(
      payload.sub,
    );
    if (targetUser && targetUser.nickname) {
      const refreshToken = this.authService.createRefreshTokenWithUserId(
        payload.sub,
      );
      await this.userRepository.save({
        userId: targetUser.userId,
        refreshToken,
      });
      return {
        success: true,
        data: {
          userInfo: targetUser,
          accessToken: novelAccessToken,
          refreshToken: refreshToken,
        },
      };
    } else if (targetUser) {
      return {
        success: true,
        data: {
          isProfileSet: false,
          accessToken: novelAccessToken,
        },
      };
    }
    throw loginError.MissingUserError;
  }

  // 프로필
  async completeFirstLogin(
    accessTokenBearer: string,
    completeFirstLoginDTO: CompleteFirstLoginDTO,
  ) {
    if (!this.validNickname.test(completeFirstLoginDTO.nickname)) {
      throw loginError.NicknameError;
    }
    if (!accessTokenBearer || !accessTokenBearer.split(' ')[1]) {
      throw loginError.AccessTokenRequiredError;
    }
    const accessToken = accessTokenBearer.split(' ')[1];
    const decrypted = this.authService.jwtVerification(accessToken);
    const userId =
      this.authService.getUserIdFromDecryptedAccessToken(decrypted);
    const novelAccessToken = jwt.sign({ sub: userId }, this.MY_SECRET_KEY, {
      expiresIn: this.ACCESS_TOKEN_DURATION,
    });
    const refreshToken = jwt.sign({ sub: userId }, this.MY_SECRET_KEY, {
      expiresIn: this.REFRESH_TOKEN_DURATION,
    });
    const existUser = await this.userRepository.findOne({
      where: {
        nickname: completeFirstLoginDTO.nickname,
      },
    });

    if (existUser) {
      throw loginError.DuplicatedNicknameError;
    }

    const novelUser = await this.userRepository.findOne({
      where: {
        userId,
      },
    });
    if (!novelUser) {
      throw loginError.MissingUserError;
    }
    const user = await this.userRepository.save({
      userId,
      nickname: completeFirstLoginDTO.nickname,
      profileImgUrl: completeFirstLoginDTO.profileImgUrl,
      portfolioUrl: completeFirstLoginDTO.profileImgUrl,
      technologyStack: completeFirstLoginDTO.technologyStack,
      refreshToken,
    });

    return {
      userInfo: user,
      accessToken: novelAccessToken,
      refreshToken: refreshToken,
    };
  }

  async refreshAccessToken(accessTokenBearer, refreshTokenBearer) {
    if (!(accessTokenBearer && refreshTokenBearer)) {
      throw loginError.MissingTokensError;
    }

    let userIdFromAccessToken: string;
    const accessToken = accessTokenBearer.split(' ')[1];
    const refreshToken = refreshTokenBearer.split(' ')[1];

    try {
      const verified = jwt.verify(accessToken, this.MY_SECRET_KEY, {
        ignoreExpiration: true,
      }) as jwt.JwtPayload;
      userIdFromAccessToken = verified.sub;
    } catch (err) {
      throw loginError.AccessTokenVerificationError;
    }
    const decrypted = this.authService.jwtVerification(refreshToken);
    const userIdFromRefreshToken =
      this.authService.getUserIdFromDecryptedRefreshToken(decrypted);

    if (userIdFromAccessToken !== userIdFromRefreshToken) {
      throw loginError.TokensMismatchError;
    }
    const userInfo = await this.userRepository.findOne({
      where: {
        userId: userIdFromAccessToken,
      },
    });
    if (!userInfo) {
      throw loginError.MissingUserError;
    }
    if (userInfo.refreshToken !== refreshToken) {
      throw loginError.RefreshTokenMismatchError;
    }
    const novelAccessToken = this.authService.createAccessTokenWithUserId(
      userIdFromAccessToken,
    );
    return {
      accessToken: novelAccessToken,
    };
  }

  async getUserInfoWithAccessToken(accessTokenBearer: string) {
    if (!accessTokenBearer) {
      throw loginError.AccessTokenRequiredError;
    }
    const decrypted = this.authService.jwtVerification(
      accessTokenBearer.split(' ')[1],
    );
    const userId =
      this.authService.getUserIdFromDecryptedAccessToken(decrypted);
    const user = await this.userRepository.findOne({
      where: {
        userId,
      },
      select: ['userId', 'profileImgUrl', 'activityPoint', 'nickname'],
    });
    if (!user) {
      throw loginError.MissingUserError;
    } else if (!user.nickname) {
      throw loginError.TutorialRequiredError;
    }
    const counts = await this.userRepository
      .createQueryBuilder('U')
      .leftJoin('U.recruitPosts', 'P')
      .leftJoin('U.chatMembers', 'M')
      .leftJoin('U.recruitApplies', 'A')
      .select('U.userId')
      .addSelect('COUNT(P.author)', 'postCount')
      .addSelect('COUNT(M.member)', 'projectCount')
      .addSelect('COUNT(A.applicant)', 'applyCount')
      .where('U.userId = :userId', { userId })
      .getRawOne();

    return {
      userInfo: user,
      postCount: parseInt(counts.postCount),
      projectCount: parseInt(counts.projectCount),
      applyCount: parseInt(counts.applyCount1),
    };
  }

  async duplicationCheckByNickname(nickname: string) {
    if (
      this.validNickname.test(nickname) &&
      1 < nickname.length &&
      nickname.length < 9
    ) {
      const result = await this.userRepository
        .createQueryBuilder('users')
        .select('users.nickname')
        .where('nickname = :nickname', { nickname })
        .getOne();
      return !result;
    }
    return false;
  }
}
