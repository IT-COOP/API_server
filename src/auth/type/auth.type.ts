export type Payload = {
  sub: string;
};

export interface CheckUserIdInterface {
  isValid: boolean;
  isProfileSet: boolean;
}

export type JwtVerifyInterFace = VerificationSucceeded | VerificationFailure;

export interface VerificationSucceeded {
  userId: string;
  message: null;
}

export interface VerificationFailure {
  userId: null;
  message: string;
}

// constraint union
