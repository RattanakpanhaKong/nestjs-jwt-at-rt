import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { Tokens } from './types';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('local/signup')
  @HttpCode(HttpStatus.CREATED)
  signUpLocal(@Body() dto: AuthDto): Promise<Tokens> {
    return this.authService.signUpLocal(dto);
  }

  @Post('local/signin')
  @HttpCode(HttpStatus.OK)
  signInLocal(@Body() dto: AuthDto): Promise<Tokens> {
    return this.authService.signInLocal(dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @Post('local/logout')
  logout(@Req() req: Request) {
    const user = req.user;
    console.log(user);
    return this.authService.logout(user['id']);
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  refreshToken(@Req() req: Request): Promise<Tokens> {
    const user = req.user;
    return this.authService.refreshTokens(user['id'], user['refreshToken']);
  }

  // @UseGuards(AuthGuard('jwt-refresh'))
  // @Post('refresh')
  // refreshToken(@Req() req: Request) {
  //   const user = req.user;
  //   return this.authService.refreshTokens(user["id"],user["email"])
  // }
}
