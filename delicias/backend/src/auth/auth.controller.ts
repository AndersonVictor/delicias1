import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() body: RegisterUserDto, @Req() req: any) {
    const result = await this.authService.registerUsuario({
      ...body,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return {
      statusCode: result.status,
      ...result.body,
    };
  }

  @Post('login')
  async login(@Body() body: LoginDto, @Req() req: any) {
    const result = await this.authService.loginUsuario(
      body.email,
      body.password,
      req.ip,
      req.headers['user-agent'],
    );
    return {
      statusCode: result.status,
      ...result.body,
    };
  }

  @Post('admin/login')
  async adminLogin(@Body() body: LoginDto, @Req() req: any) {
    const result = await this.authService.loginAdmin(
      body.email,
      body.password,
      req.ip,
      req.headers['user-agent'],
    );
    return {
      statusCode: result.status,
      ...result.body,
    };
  }

  @Get('verify')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async verify(@Req() req: any) {
    const result = await this.authService.verify(req.user);
    return {
      statusCode: result.status,
      ...result.body,
    };
  }
}
