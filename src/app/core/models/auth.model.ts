export interface LoginRequest {
  email: string;
  senha: string;
}

export interface JwtResponse {
  token: string;
  refreshToken: string;
  tipo: string;
  role: string;
  email: string;
  expiresIn: number;
}
