export class JwtResponse {
  type: string = 'Bearer';
  accessToken: string;
  refreshToken: string;

  constructor(partial: Partial<JwtResponse>) {
    Object.assign(this, partial);
  }
}
