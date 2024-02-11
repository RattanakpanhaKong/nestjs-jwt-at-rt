import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Tokens } from './types';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signUpLocal(dto: AuthDto): Promise<Tokens> {
    const hash = await this.hashData(dto.password);
    const newUser = await this.prisma.user.create({
      data: {
        email: dto.email,
        hash,
      },
    });
    const { accessToken, refreshToken } = await this.getTokens(
      newUser.id,
      newUser.email,
    );
    await this.updateRtHash(newUser.id, refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }

  async signInLocal(dto: AuthDto): Promise<Tokens> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      throw new ForbiddenException('Access Denied !');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.hash);
    if (!passwordMatches) {
      throw new ForbiddenException('Access Denied !');
    }

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: number) {
    await this.prisma.user.updateMany({
      where: {
        id: userId,
        hashedRt: {
          not: null,
        },
      },
      data: {
        hashedRt: null,
      },
    });
    return {
      message: 'Logout Successful !',
    };
  }

  // async refreshTokens(id: number,email:string) {
  //   // validate refresh token

  //   return await this.getTokens(id,email)

  // }

  async refreshTokens(userId: number, refreshToken: string): Promise<Tokens> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user || !user.hashedRt) {
      throw new ForbiddenException('Access Denied !');
    }

    // const refreshTokenMatches = await bcrypt.compare(refreshToken, user.hashedRt)
    if (refreshToken !== user.hashedRt) {
      throw new ForbiddenException('Access Denied !');
    }

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refreshToken);
    return tokens;
  }

  async updateRtHash(userId: number, refreshToken: string) {
    // const hash = await this.hashData(refreshToken);
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        // hashedRt: hash,
        hashedRt: refreshToken,
      },
    });
  }

  hashData(data: string) {
    return bcrypt.hash(data, 10);
  }

  async getTokens(userId: number, email: string): Promise<Tokens> {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        {
          id: userId,
          email,
        },
        {
          secret: 'at-secret',
          expiresIn: '30s', //should be 60?
        },
      ),
      this.jwtService.signAsync(
        {
          id: userId,
          email,
        },
        {
          secret: 'rt-secret',
          expiresIn: '1d', //should be 120?
        },
      ),
    ]);
    return {
      accessToken: at,
      refreshToken: rt,
    };
  }
}
