import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../../application/auth.service';
import { SignUpRequest } from '../dto/auth/sign-up.request';
import { JwtRequest } from '../dto/auth/jwt-request.dto';
import { JwtResponse } from '../dto/auth/jwt-response.dto';
import { RefreshTokenGuard } from '../auth/guards/refresh-token-guard';
import { RefreshJwtRequest } from '../dto/auth/refresh-jwt-request.dto';
import { UserIdPrincipal } from '../auth/decorators/userID.decorator';
import { AccessTokenGuard } from '../auth/guards/access-token-guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() dto: SignUpRequest) {
    return await this.authService.register(dto.login, dto.password);
  }

  @Post('login')
  async login(@Body() dto: JwtRequest): Promise<JwtResponse> {
    return await this.authService.authorize(dto);
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  async refresh(@Body() dto: RefreshJwtRequest): Promise<JwtResponse> {
    return await this.authService.refreshTokens(dto.refreshToken);
  }

  @UseGuards(AccessTokenGuard)
  @Get('me')
  async getUser(@UserIdPrincipal() uuid: string) {
    return await this.authService.getUserProfile(uuid);
  }
}
