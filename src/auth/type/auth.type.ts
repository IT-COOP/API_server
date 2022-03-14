export type Payload = {
  sub: string;
};

export interface CheckUserIdInterface {
  isValid: boolean;
  isProfileSet: boolean;
}

export interface JwtVerifyInterFace {
  userId: string | null;
  message: string | null;
}
