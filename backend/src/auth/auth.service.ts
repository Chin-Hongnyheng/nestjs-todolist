import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response, CookieOptions } from 'express';
import * as argon2 from 'argon2';
import { User } from '../users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { RolePermissions } from '../enums/permission.enum';


const cookieOpts: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/api/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};


@Injectable()
export class AuthService {
  private readonly refreshSecret: string;

  constructor(
    private readonly jwt: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshRepo: Repository<RefreshToken>,
  ) {
    this.refreshSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET') ||
      this.configService.getOrThrow<string>('JWT_SECRET');
  }

  async validate(email: string, pass: string): Promise<User> {
    const normalizedEmail = email?.trim().toLowerCase();
    const user = await this.userRepo.findOne({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await argon2.verify(user.password, pass);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return user;
  }

  async saveRefresh(userId: number, token: string) {
    // Delete any existing refresh token for this user
    await this.refreshRepo.delete({ userId });

    const refreshTokenEntity = this.refreshRepo.create({
      userId,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return this.refreshRepo.save(refreshTokenEntity);
  }

  async issueTokens(user: User, res: Response) {
    const permissions =
      user.permissions && user.permissions.length > 0
        ? user.permissions
        : RolePermissions[user.role] || [];
    const payload = { sub: user.id, role: user.role, permissions };
    const access = await this.jwt.signAsync(payload);

    const refresh = await this.jwt.signAsync(payload, {
      secret: this.refreshSecret,
      expiresIn: '7d',
    });

    await this.saveRefresh(user.id, refresh);

    res.cookie('access_token', access, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', refresh, {
      ...cookieOpts,
      path: '/',
    });

    return {
      message: 'Login successful',
      accessToken: access,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions,
      },
    };
  }


  async useRefresh(token: string): Promise<User> {
    if (!token) {
      throw new UnauthorizedException('Refresh token missing');
    }

    try {
      const payload = await this.jwt.verifyAsync(token, {
        secret: this.refreshSecret,
      });

      const tokenInDb = await this.refreshRepo.findOne({
        where: { token, userId: payload.sub },
      });

      if (!tokenInDb || tokenInDb.expiresAt < new Date()) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      // Rotate: remove the used refresh token so it cannot be re-used
      await this.refreshRepo.delete({ id: tokenInDb.id });

      const user = await this.userRepo.findOne({ where: { id: payload.sub } });
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return user;
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async revokeAll(userId: number): Promise<void> {
    await this.refreshRepo.delete({ userId });
  }

  async refreshTokens(refreshToken: string, res: Response) {
    const user = await this.useRefresh(refreshToken);
    return this.issueTokens(user, res);
  }

  async logout(userId: number, res: Response) {
    await this.revokeAll(userId);
    res.clearCookie('access_token');
    res.clearCookie('refresh_token', { path: '/api/auth' });
    return { message: 'Logged out successfully' };
  }

}

