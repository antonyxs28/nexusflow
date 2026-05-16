export interface JwtPayload {
  sub: string;
  role: string;
  iat: number;
}

export interface JwtDecoded extends JwtPayload {
  exp: number;
}
