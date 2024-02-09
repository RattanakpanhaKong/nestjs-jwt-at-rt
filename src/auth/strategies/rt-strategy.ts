import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ForbiddenException, Injectable } from '@nestjs/common';
@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'rt-secret',
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const refreshToken = req.get('authorization').replace('Bearer', '').trim();
    if(!refreshToken) throw new ForbiddenException('Refresh token malformed');
    
    return {
    ...payload,
    refreshToken,
    }
  }
}

// import { Injectable } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
// import { PassportStrategy } from '@nestjs/passport';
// import { Request } from 'express';
// import { ExtractJwt, Strategy } from 'passport-jwt';

// @Injectable()
// export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
//   constructor(private jwtService: JwtService) {
//     super({
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       secretOrKey: 'rt-secret',
//       passReqCallback: true,
//     });
//   }

//   async validate(req: Request, payload: any) {

//     if (req['id'] && req['email']) {
//       return true;
//     }

//     return false;
//   }

//   async getTokens(userId: number, email: string) {
//     const [at, rt] = await Promise.all([
//       this.jwtService.signAsync(
//         {
//           id: userId,
//           email,
//         },
//         {
//           secret: 'at-secret',
//           expiresIn: 60 * 15,
//         },
//       ),
//       this.jwtService.signAsync(
//         {
//           id: userId,
//           email,
//         },
//         {
//           secret: 'rt-secret',
//           expiresIn: 60 * 60 * 24 * 7,
//         },
//       ),
//     ]);
//     return {
//       accessToken: at,
//       refreshToken: rt,
//     };
//   }
// }
