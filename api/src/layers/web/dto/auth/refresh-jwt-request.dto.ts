import { IsString, IsNotEmpty } from 'class-validator';

export class RefreshJwtRequest {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
