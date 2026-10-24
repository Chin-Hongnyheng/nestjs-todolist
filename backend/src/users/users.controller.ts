import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { Roles } from '../decorators/roles.decorator';
import { RequirePermissions } from '../decorators/permissions.decorator';
import { Public } from '../decorators/public.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Role } from '../enums/role.enum';
import { Permission } from '../enums/permission.enum';
import { SanitizeUserPipe } from '../pipes/sanitize-user.pipe';

@Controller('users')
@UseGuards(AuthGuard, RolesGuard, PermissionsGuard)

export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 1. PUBLIC: Sign Up / Register (Uses custom SanitizeUserPipe from src/pipes)
  @Public()
  @Post(['signup', 'register'])
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(
    new SanitizeUserPipe({
      validateComplexity: true,
      checkForbiddenUsername: true,
    }),
  )
  signUp(@Body() createUserDto: CreateUserDto) {
    return this.usersService.signUp(createUserDto);
  }

  // 2. PUBLIC: Login (Uses custom SanitizeUserPipe from src/pipes)
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(
    new SanitizeUserPipe({
      validateComplexity: false,
      checkForbiddenUsername: false,
    }),
  )
  login(@Body() loginDto: LoginDto) {
    return this.usersService.login(loginDto);
  }

  // 3. AUTHENTICATED: Get profile of currently logged-in user
  @Get('me')
  getProfile(@CurrentUser() user: any) {
    return this.usersService.findOne(user.sub);
  }

  // 4. RBAC & PERMISSION: Requires ADMIN role & READ_USERS permission
  @Get()
  @Roles(Role.ADMIN)
  @RequirePermissions(Permission.READ_USERS)
  findAll() {
    return this.usersService.findAll();
  }

  // 5. AUTHENTICATED: Get user by ID
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  // 6. PERMISSION: Requires UPDATE_USER permission
  @Patch(':id')
  @RequirePermissions(Permission.UPDATE_USER)
  @UsePipes(
    new SanitizeUserPipe({
      validateComplexity: true,
      checkForbiddenUsername: true,
    }),
  )
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }


  // 7. RBAC & PERMISSION: Requires ADMIN role & DELETE_USER permission
  @Delete(':id')
  @Roles(Role.ADMIN)
  @RequirePermissions(Permission.DELETE_USER)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
