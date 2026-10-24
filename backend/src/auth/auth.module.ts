import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { JwtStrategy } from './jwt.strategy';
import { TodosModule } from '../todos/todos.module';

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([User, RefreshToken]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (c: ConfigService) => ({
        secret: c.getOrThrow('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
    TodosModule,
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService, JwtStrategy, PassportModule, JwtModule],
})
export class AuthModule {}
