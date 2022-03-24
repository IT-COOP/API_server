export type Payload = {
  sub: string;
};

export interface CheckUserIdInterface {
  isValid: boolean;
  isProfileSet: boolean;
}

export type JwtVerifyType = VerificationSucceeded | VerificationFailure;

export interface VerificationSucceeded {
  userId: string;
  message: null;
}

export interface VerificationFailure {
  userId: null;
  message: string;
}

// constraint union
