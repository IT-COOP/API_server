import {
  BadRequestException,
  ForbiddenException,
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
  DuplicatedNicknameError: new BadRequestException(
    'No Duplicated Nickname allowed',
  ),
  // 로그인이 필요합니다.
  LoginRequiredError: new ForbiddenException('You Need To Login First.'),
  MissingTokensError: new BadRequestException('Both Tokens Required'),
  MissingUserError: new ForbiddenException('No User Matches The userId'),
  NicknameError: new BadRequestException('Not Allowed Nickname Detected'),
  TokensMismatchError: new ForbiddenException('Tokens Mismatch Error.'),
  TutorialRequiredError: new UnauthorizedException(
    'Must Finish Tutorial First',
  ),
  RefreshTokenExpiredError: new UnauthorizedException('Refresh Token Expired.'),
  RefreshTokenMismatchError: new ForbiddenException('Refresh Token Mismatch.'),
  RefreshTokenModifiedError: new ForbiddenException(
    'Refresh Token Maliciously Modified.',
  ),
  RefreshTokenRequiredError: new BadRequestException('RefreshToken Required.'),
  RefreshTokenVerificationError: new ForbiddenException('Invalid Signature'),
};
