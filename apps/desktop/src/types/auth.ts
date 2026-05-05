export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface AuthExchangeRequest {
  code: string;
  codeVerifier: string;
  redirectUri: string;
}
