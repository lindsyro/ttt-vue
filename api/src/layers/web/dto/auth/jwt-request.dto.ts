import { IsString, IsNotEmpty } from 'class-validator';

export class JwtRequest {
  @IsString()
  @IsNotEmpty()
  login: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
