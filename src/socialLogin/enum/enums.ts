export enum LoginType {
  kakao = 1,
  google = 2,
  github = 3,
}

export enum AccessTokenErrorMessage {
  tokenExpired = 'Access Token Expired',
  tokenMalformed = 'Access Token Maliciously Modified',
  noJWT = 'Token Needed',
}

export enum RefreshTokenErrorMessage {
  tokenExpired = 'Refresh Token Expired',
  tokenMalformed = 'Refresh Token Maliciously Modified',
  noJWT = 'Token Needed',
}

export enum InputJwtError {
  tokenExpired = 'jwt expired',
  tokenMalformed = 'jwt malformed',
  noJWT = 'jwt must be provided',
}
