import { authenticator } from 'otplib';

authenticator.options = { step: 4500 };
authenticator.options = { window: 1 };
authenticator.options = { digits: 6 };

export const generateTOTP = (secret = process.env.TOTP_SECRET): { otp: string } => {
  const otp = authenticator.generate(secret);
  return { otp };
};

export const verifyTOTP = (otp: string, secret = process.env.TOTP_SECRET): boolean => {
  return authenticator.check(otp, secret);
};
