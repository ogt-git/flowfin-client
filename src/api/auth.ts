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
