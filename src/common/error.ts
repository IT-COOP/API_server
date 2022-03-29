import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  UnauthorizedException,
} from '@nestjs/common';

export const loginError = {
  // 엑세스 토큰 에러
  AccessTokenExpiredError: new UnauthorizedException('Access Token Expired.'),
  AccessTokenModifiedError: new ForbiddenException(
    'Access Token Maliciously Modified.',
  ),
  AccessTokenRequiredError: new BadRequestException('AccessToken Required.'),
  AccessTokenVerificationError: new ForbiddenException('Invalid Signature'),
  // 닉네임 중복 에러
  DuplicatedNicknameError: new BadRequestException(
    'No Duplicated Nickname allowed',
  ),
  // 로그인이 필요합니다.
  LoginRequiredError: new ForbiddenException('You Need To Login First.'),
  // 토큰이 두 종류 모두는 존재하지 않을 때 에러
  MissingTokensError: new BadRequestException('Both Tokens Required'),
  // 토큰 userId 못 찾은 에러
  MissingUserError: new ForbiddenException('No User Matches The userId'),
  // 튜토리얼 닉네임 에러
  NicknameError: new BadRequestException('Not Allowed Nickname Detected'),
  // 엑세스 토큰, 리프레시 토큰 userId 상이 에러
  TokensMismatchError: new ForbiddenException('Tokens Mismatch Error.'),
  // 닉네임 없음 에러
  TutorialRequiredError: new UnauthorizedException(
    'Must Finish Tutorial First',
  ),
  // 리프레시 토큰 에러
  RefreshTokenExpiredError: new UnauthorizedException('Refresh Token Expired.'),
  RefreshTokenMismatchError: new ForbiddenException('Refresh Token Mismatch.'),
  RefreshTokenModifiedError: new ForbiddenException(
    'Refresh Token Maliciously Modified.',
  ),
  RefreshTokenRequiredError: new BadRequestException('RefreshToken Required.'),
  RefreshTokenVerificationError: new ForbiddenException(
    'RefreshToken Invalid Signature',
  ),
};

export const recruitError = {
  //잘못된 요청을 보낼 때 에러
  WrongRequiredError: new HttpException(
    { message: 'You sent the wrong request.' },
    400,
  ),
  DBqueryError: new HttpException({ message: 'Try again' }, 500),
  DuplicateOneRecruitApply: new HttpException(
    { message: 'You have already applied.' },
    400,
  ),
  MaxProgressProjectError: new HttpException(
    { message: ' You can only apply for three projects.' },
    400,
  ),
  DuplicateOneRecruitKeep: new HttpException(
    { message: 'You have already kept.' },
    400,
  ),
};
