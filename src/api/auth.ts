import http from './http';

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  termsVersion: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResult {
  accessToken: string;
  name: string;
  userId: number;
  email: string;
  riskType: string | null;
}

export type RiskType =
  | 'CONSERVATIVE'
  | 'MODERATELY_CONSERVATIVE'
  | 'MODERATE'
  | 'MODERATELY_AGGRESSIVE'
  | 'AGGRESSIVE';

export async function signup(payload: SignupPayload): Promise<void> {
  await http.post('/api/auth/signup', payload);
}

export async function login(payload: LoginPayload): Promise<LoginResult> {
  const res = await http.post<LoginResult>('/api/auth/login', payload);
  return res.data;
}

export async function updateTendency(riskType: RiskType): Promise<void> {
  await http.post('/api/users/tendency', { riskType });
}

export async function requestEmailVerify(email: string): Promise<void> {
  await http.post('/api/auth/email-verify/request', { email });
}

export async function confirmEmailVerify(email: string, otp: string): Promise<string> {
  const res = await http.post<{ verificationToken: string }>('/api/auth/email-verify/confirm', { email, otp });
  return res.data.verificationToken;
}

export async function requestPasswordReset(email: string): Promise<void> {
  await http.post('/api/auth/password-reset/request', { email });
}

export async function confirmPasswordReset(email: string, otp: string, newPassword: string): Promise<void> {
  await http.post('/api/auth/password-reset/confirm', { email, otp, newPassword });
}
