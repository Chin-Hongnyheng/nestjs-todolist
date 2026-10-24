import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  Req,
  HttpCode,
  UsePipes,
  UseGuards,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { Public } from '../decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import type { AuthUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginDto } from '../users/dto/login.dto';
import { SanitizeUserPipe } from '../pipes/sanitize-user.pipe';
import { User } from '../users/entities/user.entity';
import { TodosService } from '../todos/todos.service';
import { CreateTodoDto } from '../todos/dto/create-todo.dto';

@Controller(['api/auth', 'auth'])
@UseGuards(JwtAuthGuard)
export class AuthController {

  constructor(
    private readonly auth: AuthService,
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly todos: TodosService,
  ) {}

  @Public()
  @HttpCode(200)
  @Post('login')
  @UsePipes(
    new SanitizeUserPipe({
      validateComplexity: false,
      checkForbiddenUsername: false,
    }),
  )
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true })
    res: Response,
  ) {
    const u = await this.auth.validate(dto.email, dto.password);
    return this.auth.issueTokens(u, res);
  }

  @Public()
  @HttpCode(200)
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = req.cookies['refresh_token']; // needs cookie-parser
    const user = await this.auth.useRefresh(token); // verify + rotate, else 401
    return this.auth.issueTokens(user, res); // new access + new refresh
  }

  @Public()
  @HttpCode(204)
  @Post('logout')
  async logout(
    @CurrentUser() user: AuthUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (user?.id) {
      await this.auth.revokeAll(user.id);
    }
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/api/auth' });
  }


  @Get(['me', 'auth/me'])
  async me(@CurrentUser() user: AuthUser) {
    const u = await this.users.findOneByOrFail({ id: user.id });
    const { password, ...userWithoutPassword } = u;
    return userWithoutPassword;
  }


  @Post('todos')
  create(
    @Body() dto: CreateTodoDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.todos.create(dto, user.id);
  }
}
